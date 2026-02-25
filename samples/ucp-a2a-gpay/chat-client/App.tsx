/*
 * Copyright 2026 UCP Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React, {useEffect, useRef, useState} from 'react';
import ChatInput from './components/ChatInput';
import ChatMessageComponent from './components/ChatMessage';
import Header from './components/Header';
import {appConfig} from './config';
import {CredentialProviderProxy} from './mocks/credentialProviderProxy';

import {ChatMessage, Checkout, PaymentInstrument, Product, Sender} from './types';

const initialMessage: ChatMessage = {
  sender: Sender.MODEL,
  text: appConfig.defaultMessage,
};

/**
 * An example A2A chat client that demonstrates consuming a business's A2A Agent with UCP Extension.
 * Only for demo purposes, not intended for production use.
 */
function App() {
  const [user_email, setUserEmail] = useState<string | null>('foo@example.com');
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [isLoading, setIsLoading] = useState(false);
  const [contextId, setContextId] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const credentialProvider = useRef(new CredentialProviderProxy());
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const gpayShippingRef = useRef<{
    shippingOptionId?: string;
    shippingCost?: number;
  } | null>(null);

  const applyGpayShippingToCheckout = (
    checkout: Checkout,
    shipping: {shippingOptionId?: string; shippingCost?: number},
  ): Checkout => {
    if (shipping.shippingCost == null) return checkout;
    const subtotal =
      checkout.totals.find((t) => t.type === 'subtotal')?.amount ?? 0;
    const tax = checkout.totals.find((t) => t.type === 'tax')?.amount ?? 0;
    const shippingAmountCents = Math.round(shipping.shippingCost * 100);
    const newTotal = subtotal + tax + shippingAmountCents;
    const shippingLabel =
      shipping.shippingOptionId === 'shipping-express'
        ? 'Express shipping'
        : 'Standard shipping';

    const newTotals = checkout.totals.map((t) => {
      if (t.type === 'fulfillment' || t.type === 'shipping') {
        return {...t, amount: shippingAmountCents, display_text: shippingLabel};
      }
      if (t.type === 'total') {
        return {...t, amount: newTotal};
      }
      return t;
    });

    const hasShipping = newTotals.some(
      (t) => t.type === 'fulfillment' || t.type === 'shipping',
    );
    if (!hasShipping) {
      const totalIdx = newTotals.findIndex((t) => t.type === 'total');
      const insertIdx = totalIdx >= 0 ? totalIdx : newTotals.length;
      newTotals.splice(insertIdx, 0, {
        type: 'shipping',
        display_text: shippingLabel,
        amount: shippingAmountCents,
      });
    }

    return {...checkout, totals: newTotals};
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

  // Scroll to the bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
    const hasPaymentMethods = messages.some((m) => (m.paymentMethods?.length ?? 0) > 0);
    if (hasPaymentMethods) {
      const t1 = setTimeout(scrollToBottom, 300);
      const t2 = setTimeout(scrollToBottom, 800);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [messages]);

  const handleAddToCheckout = (productToAdd: Product) => {
    const actionPayload = JSON.stringify({
      action: 'add_to_checkout',
      product_id: productToAdd.productID,
      quantity: 1,
    });
    handleSendMessage(actionPayload, {isUserAction: true});
  };

  const handleStartPayment = () => {
    const actionPayload = JSON.stringify({action: 'start_payment'});
    handleSendMessage(actionPayload, {
      isUserAction: true,
    });
  };

  const handlePaymentMethodSelection = async (checkout: any) => {
    if (!checkout || !checkout.payment || !checkout.payment.handlers) {
      const errorMessage: ChatMessage = {
        sender: Sender.MODEL,
        text: "Sorry, I couldn't retrieve payment methods.",
      };
      setMessages((prev) => [...prev, errorMessage]);
      return;
    }

    //find the handler with id "example_payment_provider"
    const handler = checkout.payment.handlers.find(
      (handler: any) => handler.id === 'example_payment_provider',
    );
    if (!handler) {
      const errorMessage: ChatMessage = {
        sender: Sender.MODEL,
        text: "Sorry, I couldn't find the supported payment handler.",
      };
      setMessages((prev) => [...prev, errorMessage]);
      return;
    }

    try {
      const paymentResponse =
        await credentialProvider.current.getSupportedPaymentMethods(
          user_email,
          handler.config,
        );
      const paymentMethods = paymentResponse.payment_method_aliases;

      const paymentSelectorMessage: ChatMessage = {
        sender: Sender.MODEL,
        text: '',
        paymentMethods,
      };
      setMessages((prev) => [...prev, paymentSelectorMessage]);
    } catch (error) {
      console.error('Failed to resolve mandate:', error);
      const errorMessage: ChatMessage = {
        sender: Sender.MODEL,
        text: "Sorry, I couldn't retrieve payment methods.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handlePaymentMethodSelected = async (selectedMethod: string) => {
    // Hide the payment selector by removing it from the messages
    setMessages((prev) => prev.filter((msg) => !msg.paymentMethods));

    // Add a temporary user message
    const userActionMessage: ChatMessage = {
      sender: Sender.USER,
      text: `User selected payment method: ${selectedMethod}`,
      isUserAction: true,
    };
    setMessages((prev) => [...prev, userActionMessage]);

    try {
      if (!user_email) {
        throw new Error('User email is not set.');
      }

      const paymentInstrument =
        await credentialProvider.current.getPaymentToken(
          user_email,
          selectedMethod,
        );

      if (!paymentInstrument || !paymentInstrument.credential) {
        throw new Error('Failed to retrieve payment credential');
      }

      const paymentInstrumentMessage: ChatMessage = {
        sender: Sender.MODEL,
        text: '',
        paymentInstrument,
      };
      setMessages((prev) => [...prev, paymentInstrumentMessage]);
    } catch (error) {
      console.error('Failed to process payment mandate:', error);
      const errorMessage: ChatMessage = {
        sender: Sender.MODEL,
        text: "Sorry, I couldn't process the payment. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const parseNameToFirstLast = (name: string): {first_name: string; last_name: string} => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    const first_name = parts[0] ?? '';
    const last_name = parts.slice(1).join(' ') ?? '';
    return {first_name, last_name};
  };

  const handleGooglePayComplete = async (data: {
    token: string;
    last_digits?: string;
    brand?: string;
    email?: string;
    shippingAddress?: {
      name?: string;
      address1?: string;
      address2?: string;
      address3?: string;
      locality?: string;
      administrativeArea?: string;
      postalCode?: string;
      countryCode?: string;
    };
    shippingOptionId?: string;
    shippingCost?: number;
  }) => {
    setMessages((prev) => {
      let next = prev.filter((msg) => !msg.paymentMethods);

      if (data.shippingCost != null) {
        const lastCheckoutIdx = next.map((m) => !!m.checkout).lastIndexOf(true);
        if (lastCheckoutIdx >= 0) {
          const msg = next[lastCheckoutIdx];
          if (msg.checkout) {
            const subtotal =
              msg.checkout.totals.find((t) => t.type === 'subtotal')?.amount ??
              0;
            const tax =
              msg.checkout.totals.find((t) => t.type === 'tax')?.amount ?? 0;
            const shippingAmountCents = Math.round(data.shippingCost * 100);
            const newTotal = subtotal + tax + shippingAmountCents;
            const shippingLabel =
              data.shippingOptionId === 'shipping-express'
                ? 'Express shipping'
                : 'Standard shipping';

            const newTotals = msg.checkout.totals.map((t) => {
              if (t.type === 'fulfillment' || t.type === 'shipping') {
                return {
                  ...t,
                  amount: shippingAmountCents,
                  display_text: shippingLabel,
                };
              }
              if (t.type === 'total') {
                return {...t, amount: newTotal};
              }
              return t;
            });

            const hasShipping = newTotals.some(
              (t) => t.type === 'fulfillment' || t.type === 'shipping',
            );
            if (!hasShipping) {
              const totalIdx = newTotals.findIndex((t) => t.type === 'total');
              const insertIdx = totalIdx >= 0 ? totalIdx : newTotals.length;
              newTotals.splice(insertIdx, 0, {
                type: 'shipping',
                display_text: shippingLabel,
                amount: shippingAmountCents,
              });
            }

            next = [...next];
            next[lastCheckoutIdx] = {
              ...msg,
              checkout: {...msg.checkout, totals: newTotals},
            };
          }
        }
      }

      const userActionMessage: ChatMessage = {
        sender: Sender.USER,
        text: 'User selected Google Pay',
        isUserAction: true,
      };
      return [...next, userActionMessage];
    });

    const paymentInstrument: PaymentInstrument = {
      id: 'gpay_' + crypto.randomUUID(),
      type: 'card',
      brand: data.brand ?? 'google_pay',
      last_digits: data.last_digits ?? '****',
      expiry_month: 12,
      expiry_year: 2030,
      handler_id: credentialProvider.current.handler_id,
      handler_name: credentialProvider.current.handler_name,
      credential: {type: 'token', token: data.token},
    };

    if (data.email || data.shippingAddress) {
      gpayShippingRef.current =
        data.shippingCost != null
          ? {
              shippingOptionId: data.shippingOptionId,
              shippingCost: data.shippingCost,
            }
          : null;

      const addr = data.shippingAddress;
      const {first_name, last_name} = addr?.name
        ? parseNameToFirstLast(addr.name)
        : {first_name: 'Guest', last_name: ''};

      const shippingOptionId =
        data.shippingOptionId === 'shipping-express'
          ? 'express'
          : data.shippingOptionId === 'shipping-standard'
            ? 'standard'
            : undefined;
      const actionPayload = JSON.stringify({
        action: 'update_customer_details',
        email: data.email ?? '',
        first_name: first_name || 'Guest',
        last_name,
        street_address: addr?.address1 ?? '',
        extended_address: [addr?.address2, addr?.address3].filter(Boolean).join(', ') || undefined,
        address_locality: addr?.locality ?? '',
        address_region: addr?.administrativeArea ?? '',
        postal_code: addr?.postalCode ?? '',
        address_country: addr?.countryCode ?? 'US',
        shipping_option_id: shippingOptionId ?? 'standard',
      });
      await handleSendMessage(actionPayload, {
        isUserAction: true,
        skipPaymentMethods: true,
        skipGpayShippingApply: true,
      });
    }

    setMessages((prev) => {
      const lastIdx = prev.length - 1;
      const last = lastIdx >= 0 ? prev[lastIdx] : null;
      const canMerge =
        last?.sender === Sender.MODEL &&
        last.checkout &&
        !last.paymentInstrument;

      if (canMerge) {
        const merged: ChatMessage = {
          ...last,
          paymentInstrument,
        };
        return [...prev.slice(0, -1), merged];
      }

      const paymentInstrumentMessage: ChatMessage = {
        sender: Sender.MODEL,
        text: '',
        paymentInstrument,
      };
      return [...prev, paymentInstrumentMessage];
    });
  };

  const handleConfirmPayment = async (paymentInstrument: PaymentInstrument) => {
    gpayShippingRef.current = null;

    const userActionMessage: ChatMessage = {
      sender: Sender.USER,
      text: `User confirmed payment.`,
      isUserAction: true,
    };
    setMessages((prev) => [
      ...prev.filter((msg) => !msg.paymentInstrument),
      userActionMessage,
    ]);

    try {
      const parts = [
        {type: 'data', data: {'action': 'complete_checkout'}},
        {
          type: 'data',
          data: {
            'a2a.ucp.checkout.payment_data': paymentInstrument,
            'a2a.ucp.checkout.risk_signals': {'data': 'some risk data'},
          },
        },
      ];

      await handleSendMessage(parts, {
        isUserAction: true,
      });
    } catch (error) {
      console.error('Error confirming payment:', error);
      const errorMessage: ChatMessage = {
        sender: Sender.MODEL,
        text: 'Sorry, there was an issue confirming your payment.',
      };
      // If handleSendMessage wasn't called, we might need to manually update state
      // In this case, we remove the loading indicator that handleSendMessage would have added
      setMessages((prev) => [...prev.slice(0, -1), errorMessage]); // This assumes handleSendMessage added a loader
      setIsLoading(false); // Ensure loading is stopped on authorization error
    }
  };

  const handleSendMessage = async (
    messageContent: string | any[],
    options?: {
      isUserAction?: boolean;
      headers?: Record<string, string>;
      skipPaymentMethods?: boolean;
      skipGpayShippingApply?: boolean;
    },
  ) => {
    if (isLoading) return;

    const userMessage: ChatMessage = {
      sender: Sender.USER,
      text: options?.isUserAction
        ? '<User Action>'
        : typeof messageContent === 'string'
          ? messageContent
          : 'Sent complex data',
    };
    if (userMessage.text) {
      // Only add if there's text
      setMessages((prev) => [...prev, userMessage]);
    }
    setMessages((prev) => [
      ...prev,
      {sender: Sender.MODEL, text: '', isLoading: true},
    ]);
    setIsLoading(true);

    try {
      const requestParts =
        typeof messageContent === 'string'
          ? [{type: 'text', text: messageContent}]
          : messageContent;

      const requestParams: any = {
        message: {
          role: 'user',
          parts: requestParts,
          messageId: crypto.randomUUID(),
          kind: 'message',
        },
        configuration: {
          historyLength: 0,
        },
      };

      if (contextId) {
        requestParams.message.contextId = contextId;
      }
      if (taskId) {
        requestParams.message.taskId = taskId;
      }

      const defaultHeaders = {
        'Content-Type': 'application/json',
        'X-A2A-Extensions':
          'https://ucp.dev/specification/reference?v=2026-01-11',
        'UCP-Agent':
          'profile="http://localhost:3000/profile/agent_profile.json"',
      };

      const response = await fetch('/api', {
        method: 'POST',
        headers: {...defaultHeaders, ...options?.headers},
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: crypto.randomUUID(),
          method: 'message/send',
          params: requestParams,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      // Update context and task IDs from the response for subsequent requests
      if (data.result?.contextId) {
        setContextId(data.result.contextId);
      }
      //if there is a task and it's in one of the active states
      if (
        data.result?.id &&
        data.result?.status?.state in ['working', 'submitted', 'input-required']
      ) {
        setTaskId(data.result.id);
      } else {
        //if not reset taskId
        setTaskId(undefined);
      }

      const combinedBotMessage: ChatMessage = {
        sender: Sender.MODEL,
        text: '',
      };
      let requiresMoreInfo = false;

      const responseParts =
        data.result?.parts ||
        data.result?.status?.message?.parts ||
        data.result?.artifacts?.[0]?.parts ||
        [];

      for (const part of responseParts) {
        const p = part.root ?? part;
        const text = p.text ?? part.text;
        const data = p.data ?? part.data;
        if (text) {
          combinedBotMessage.text +=
            (combinedBotMessage.text ? '\n' : '') + text;
        } else if (data?.['a2a.product_results']) {
          combinedBotMessage.text +=
            (combinedBotMessage.text ? '\n' : '') +
            (data['a2a.product_results'].content || '');
          combinedBotMessage.products = data['a2a.product_results'].results;
        } else if (data?.['a2a.ucp.checkout']) {
          combinedBotMessage.checkout = data['a2a.ucp.checkout'];
        } else if (data?.status === 'requires_more_info') {
          requiresMoreInfo = true;
        }
      }

      // Handle requires_more_info: show payment method OR customer details
      const checkoutForPayment =
        combinedBotMessage.checkout ?? lastCheckout;
      if (requiresMoreInfo && checkoutForPayment) {
        const hasPaymentMethod =
          (checkoutForPayment.payment?.instruments?.length ?? 0) > 0 ||
          !!checkoutForPayment.payment?.selected_instrument_id;
        const hasCustomerDetails =
          !!checkoutForPayment.buyer && !!checkoutForPayment.fulfillment;

        if (
          !options?.skipPaymentMethods &&
          !hasPaymentMethod &&
          checkoutForPayment.payment?.handlers
        ) {
          // No payment method selected → show select payment method only (no checkout)
          try {
            const handler = checkoutForPayment.payment.handlers.find(
              (h: any) => h.id === 'example_payment_provider',
            );
            if (handler) {
              const paymentResponse =
                await credentialProvider.current.getSupportedPaymentMethods(
                  user_email ?? '',
                  handler.config,
                );
              combinedBotMessage.paymentMethods =
                paymentResponse.payment_method_aliases;
            }
          } catch (err) {
            console.error('Failed to fetch payment methods:', err);
          }
        } else if (hasPaymentMethod && !hasCustomerDetails) {
          // Payment method selected but no customer details → manual input
          combinedBotMessage.checkout = checkoutForPayment;
          combinedBotMessage.customerDetailOptions = true;
        }
      }

      // Show payment method selection when checkout is ready_for_complete
      if (
        !options?.skipPaymentMethods &&
        checkoutForPayment?.status === 'ready_for_complete' &&
        checkoutForPayment?.payment?.handlers
      ) {
        if (!combinedBotMessage.checkout) {
          combinedBotMessage.checkout = checkoutForPayment;
        }
        if (!combinedBotMessage.paymentMethods) {
          try {
            const handler = checkoutForPayment.payment.handlers.find(
              (h: any) => h.id === 'example_payment_provider',
            );
            if (handler) {
              const paymentResponse =
                await credentialProvider.current.getSupportedPaymentMethods(
                  user_email ?? '',
                  handler.config,
                );
              combinedBotMessage.paymentMethods =
                paymentResponse.payment_method_aliases;
            }
          } catch (err) {
            console.error('Failed to fetch payment methods:', err);
          }
        }
      }

      if (
        !options?.skipGpayShippingApply &&
        combinedBotMessage.checkout &&
        gpayShippingRef.current?.shippingCost != null
      ) {
        combinedBotMessage.checkout = applyGpayShippingToCheckout(
          combinedBotMessage.checkout,
          gpayShippingRef.current,
        );
        gpayShippingRef.current = null;
      }

      const newMessages: ChatMessage[] = [];
      const hasContent =
        combinedBotMessage.text ||
        combinedBotMessage.products ||
        combinedBotMessage.checkout ||
        combinedBotMessage.customerDetailOptions ||
        (combinedBotMessage.paymentMethods?.length ?? 0) > 0;
      if (hasContent) {
        newMessages.push(combinedBotMessage);
      }

      if (newMessages.length > 0) {
        setMessages((prev) => [...prev.slice(0, -1), ...newMessages]);
      } else {
        console.error(
          '[App] Unparseable response - no content extracted (client fallback).',
          '\ndata.result:',
          JSON.stringify(data.result, null, 2),
          '\nresponseParts length:',
          responseParts.length,
        );
        const fallbackResponse =
          "Sorry, I received a response I couldn't understand.";
        setMessages((prev) => [
          ...prev.slice(0, -1),
          {sender: Sender.MODEL, text: fallbackResponse},
        ]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        sender: Sender.MODEL,
        text: 'Sorry, something went wrong. Please try again.',
      };
      // Replace the placeholder with the error message
      setMessages((prev) => [...prev.slice(0, -1), errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const lastCheckoutIndex = messages.map((m) => !!m.checkout).lastIndexOf(true);
  const lastCheckout =
    lastCheckoutIndex >= 0 ? messages[lastCheckoutIndex].checkout : null;
  const hasPaymentInstrumentInMessages = messages.some(
    (m) => !!m.paymentInstrument,
  );

  const handleSendMessageWithShortcuts = (messageContent: string | any[]) => {
    handleSendMessage(messageContent);
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-[#f5f5f5] font-sans">
      <Header logoUrl={appConfig.logoUrl} title={appConfig.name} />
      <main
        ref={chatContainerRef}
        className="flex-grow overflow-y-auto p-4 md:p-6 space-y-2">
        {messages.map((msg, index) => (
          <ChatMessageComponent
            key={index}
            message={msg}
            onAddToCart={handleAddToCheckout}
            onCheckout={
              msg.checkout?.status !== 'ready_for_complete'
                ? handleStartPayment
                : undefined
            }
            onSelectPaymentMethod={handlePaymentMethodSelected}
            onGooglePayComplete={handleGooglePayComplete}
            onGooglePayReady={scrollToBottom}
            lastCheckout={lastCheckout}
            onConfirmPayment={handleConfirmPayment}
            onCompletePayment={
              msg.checkout?.status === 'ready_for_complete' && !msg.paymentMethods
                ? handlePaymentMethodSelection
                : undefined
            }
            isLastCheckout={index === lastCheckoutIndex}
            hasPaymentInstrumentInMessages={hasPaymentInstrumentInMessages}
          />
        ))}
      </main>
      <ChatInput
            onSendMessage={handleSendMessageWithShortcuts}
            isLoading={isLoading}
          />
    </div>
  );
}

export default App;

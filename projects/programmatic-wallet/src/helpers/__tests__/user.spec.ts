import { describe, it, expect } from "vitest";
import { getEmail, getEvmAddress } from "../user";
import type { Config, User } from "@coinbase/cdp-core";

describe("user", () => {
  describe("getEmail", () => {
    it("returns email when user has email authentication", () => {
      const user: User = {
        userId: "user-1",
        authenticationMethods: {
          email: { type: "email", email: "test@example.com" },
        },
      };
      expect(getEmail(user)).toBe("test@example.com");
    });

    it("throws when user has no email in authentication methods", () => {
      const user: User = {
        userId: "user-1",
        authenticationMethods: {},
      };
      expect(() => getEmail(user)).toThrow(
        "Could not retrieve your email address. Please try signing in again."
      );
    });

    it("throws when authenticationMethods is undefined", () => {
      const user = {
        userId: "user-1",
      } as User;
      expect(() => getEmail(user)).toThrow(
        "Could not retrieve your email address. Please try signing in again."
      );
    });

    it("throws when user has sms but no email authentication", () => {
      const user: User = {
        userId: "user-1",
        authenticationMethods: {
          sms: { type: "sms", phoneNumber: "+1234567890" },
        },
      };
      expect(() => getEmail(user)).toThrow(
        "Could not retrieve your email address. Please try signing in again."
      );
    });
  });

  describe("getEvmAddress", () => {
    const eoaConfig: Config = {
      projectId: "test",
      ethereum: { createOnLogin: "eoa" },
    };

    const smartConfig: Config = {
      projectId: "test",
      ethereum: { createOnLogin: "smart" },
    };

    it("returns EOA address when createOnLogin is eoa and user has evmAccountObjects", () => {
      const user: User = {
        userId: "user-1",
        authenticationMethods: {},
        evmAccountObjects: [
          { address: "0x1234567890123456789012345678901234567890" as `0x${string}`, createdAt: "2024-01-01" },
        ],
      };
      expect(getEvmAddress(user, eoaConfig)).toBe(
        "0x1234567890123456789012345678901234567890"
      );
    });

    it("returns address from evmAccounts when createOnLogin is eoa and evmAccountObjects is empty", () => {
      const user: User = {
        userId: "user-1",
        authenticationMethods: {},
        evmAccounts: ["0xabcdefabcdefabcdefabcdefabcdefabcdefabcd" as `0x${string}`],
      };
      expect(getEvmAddress(user, eoaConfig)).toBe(
        "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd"
      );
    });

    it("returns smart account address when createOnLogin is smart and user has evmSmartAccountObjects", () => {
      const user: User = {
        userId: "user-1",
        authenticationMethods: {},
        evmSmartAccountObjects: [
          {
            address: "0xsmart1234567890123456789012345678901234" as `0x${string}`,
            ownerAddresses: [],
            createdAt: "2024-01-01",
          },
        ],
      };
      expect(getEvmAddress(user, smartConfig)).toBe(
        "0xsmart1234567890123456789012345678901234"
      );
    });

    it("returns address from evmAccounts when createOnLogin is smart and evmSmartAccountObjects is empty", () => {
      const user: User = {
        userId: "user-1",
        authenticationMethods: {},
        evmAccounts: ["0xfallback12345678901234567890123456789012" as `0x${string}`],
      };
      expect(getEvmAddress(user, smartConfig)).toBe(
        "0xfallback12345678901234567890123456789012"
      );
    });

    it("returns undefined when user has no EVM address", () => {
      const user: User = {
        userId: "user-1",
        authenticationMethods: {},
      };
      expect(getEvmAddress(user, eoaConfig)).toBeUndefined();
    });

    it("defaults to EOA behavior when config has no ethereum", () => {
      const config: Config = { projectId: "test" };
      const user: User = {
        userId: "user-1",
        authenticationMethods: {},
        evmAccountObjects: [
          { address: "0xdefault123456789012345678901234567890" as `0x${string}`, createdAt: "2024-01-01" },
        ],
      };
      expect(getEvmAddress(user, config)).toBe(
        "0xdefault123456789012345678901234567890"
      );
    });
  });
});

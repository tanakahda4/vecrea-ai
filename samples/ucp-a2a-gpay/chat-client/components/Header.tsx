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
import React from 'react';

function CartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  );
}

function Header() {
  return (
    <header className="bg-[#004d40] p-4 flex-shrink-0 flex items-center gap-3 border-b-2 border-[#7cb342]">
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#7cb342] flex items-center justify-center shadow-lg ring-2 ring-white/30">
        <CartIcon className="h-7 w-7 text-[#004d40]" />
      </div>
      <h1 className="text-xl font-bold text-white">Shopping Agent</h1>
    </header>
  );
}

export {CartIcon};
export default Header;

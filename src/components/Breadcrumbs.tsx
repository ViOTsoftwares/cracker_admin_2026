"use client";

import Link from "next/link";

const Breadcrumbs = ({ path }:any) => {
  return (
    <nav className="text-sm text-gray-500">
      <ol className="flex items-center gap-2">
        <li>
          <a href="/" className="hover:text-blue-600 transition-colors">
            Dashboard
          </a>
        </li>
        <li className="text-gray-400">/</li>
        <li className="font-medium text-gray-800">{path}</li>
      </ol>
    </nav>
  );
};

export default Breadcrumbs;

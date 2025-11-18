import React from "react";

export default function AuthFormLayout({ title, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-center text-indigo-600 mb-6">{title}</h1>
        {children}
        <p className="mt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Bug Report
        </p>
      </div>
    </div>
  );
}

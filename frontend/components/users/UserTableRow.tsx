"use client"

import { MoreVertical, CheckCircle, XCircle } from "lucide-react"

interface UserTableRowProps {
  name: string
  phone: string
  city: string
  role: string
  verified: boolean
}

export function UserTableRow({ name, phone, city, role, verified }: UserTableRowProps) {
  return (
    <div className="grid grid-cols-6 gap-4 px-6 py-4 border-b border-gray-100 hover:bg-indigo-50/50 transition-colors items-center">
      <div className="font-medium text-gray-900">{name}</div>
      <div className="text-gray-600">{phone}</div>
      <div className="text-gray-600">{city}</div>
      <div>
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
          {role}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {verified ? (
          <>
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm text-green-600 font-medium">Verified</span>
          </>
        ) : (
          <>
            <XCircle className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-500">Not Verified</span>
          </>
        )}
      </div>
      <div>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <MoreVertical className="h-5 w-5 text-gray-600" />
        </button>
      </div>
    </div>
  )
}
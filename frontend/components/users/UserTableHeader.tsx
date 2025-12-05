"use client"

export function UserTableHeader() {
  return (
    <div className="grid grid-cols-6 gap-4 bg-linear-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-t-xl font-semibold">
      <div>Name</div>
      <div>Phone</div>
      <div>City</div>
      <div>Role</div>
      <div>Verified</div>
      <div>Actions</div>
    </div>
  )
}
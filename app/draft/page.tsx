
export default function Draft() {
 
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      if (row.getValue("status") === "available") {
        return (
          <div>
            {" "}
            <span
              className={`rounded-full py-0.5 px-2 bg-green-200 text-green-700 font-medium`}
            >
              {row.getValue("status")}
            </span>{" "}
          </div>
        );
      } else if (row.getValue("status") === "booked") {
        return (
          <div>
            {" "}
            <span
              className={`rounded-full py-0.5 px-2 bg-pink-200 text-pink-700 font-medium`}
            >
              {row.getValue("status")}
            </span>{" "}
          </div>
        );
      } 
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <div>{row.getValue("status")}</div>,
  },

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
     
    </main>
  );
}

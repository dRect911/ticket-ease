"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  RefreshCw,
  User,
  Calendar,
  MapPin,
  Bus,
  Ticket,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Booking, Ticket as TicketType, Travel, Profile } from "@/types";
import {
  getProfileById,
  getTicketById,
  getTravelById,
  getRouteIdByTravelId,
  getRouteLocations,
  getLocationNameById,
  getBusIdByTravelId,
  getBusById,
  deleteBooking,
} from "@/utils/supabase/queries";
import { useBookingDetails, useBookings } from "@/hooks/useCachedData";
import { useToast } from "./ui/use-toast";
import { cacheUtils } from "@/utils/cache-utils";

interface BookingDetails extends Booking {
  user_profile: Profile;
  ticket: TicketType;
  travel: Travel;
  bus_plate: string;
  departure_name: string;
  arrival_name: string;
  travel_date: string;
  seat_number: number;
  price: number;
}

const columns: ColumnDef<BookingDetails>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "user_profile",
    header: "Customer",
    cell: ({ row }) => {
      const profile = row.getValue("user_profile") as Profile;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" alt="Avatar" />
            <AvatarFallback>
              {`${profile?.first_name?.[0] || ""}${profile?.last_name?.[0] || ""}`}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">
              {`${profile?.first_name || ""} ${profile?.last_name || ""}`}
            </span>
            <span className="text-sm text-muted-foreground">
              {profile?.email || ""}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "booking_date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Booking Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("booking_date"));
      return (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>
            {date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span className="text-sm text-muted-foreground">
            {date.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "travel_date",
    header: "Travel Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("travel_date"));
      return (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>
            {date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "departure_name",
    header: "From",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-sky-600" />
          <span className="text-sky-600 font-medium">
            {row.getValue("departure_name")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "arrival_name",
    header: "To",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-orange-600" />
          <span className="text-orange-600 font-medium">
            {row.getValue("arrival_name")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "bus_plate",
    header: "Bus",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Bus className="h-4 w-4 text-muted-foreground" />
        <span className="font-mono">{row.getValue("bus_plate")}</span>
      </div>
    ),
  },
  {
    accessorKey: "seat_number",
    header: "Seat",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Ticket className="h-4 w-4 text-muted-foreground" />
        <Badge variant="secondary">{row.getValue("seat_number")}</Badge>
      </div>
    ),
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-right font-medium text-green-600">
        {`${row.getValue("price")} XOF`}
      </div>
    ),
  },
  {
    accessorKey: "ticket.status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.ticket.status;
      return (
        <Badge 
          variant={status === "booked" ? "default" : "secondary"}
          className={status === "booked" ? "bg-green-100 text-green-800" : ""}
        >
          {status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const booking = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(booking.booking_id)}
            >
              Copy booking ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => console.log("View booking details", booking)}
            >
              View details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => console.log("Edit booking", booking)}
            >
              Edit booking
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={async () => {
                try {
                  const deleted = await deleteBooking(booking.booking_id);
                  if (deleted) {
                    // Invalidate cache after successful deletion
                    cacheUtils.invalidateBookings();
                    // Refresh data
                    window.location.reload();
                  }
                } catch (error) {
                  console.error("Error deleting booking:", error);
                }
              }}
              className="text-red-600"
            >
              Delete booking
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function BookingTable() {
  const { toast } = useToast();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [loading, setLoading] = React.useState<boolean>(true);
  const [data, setData] = React.useState<BookingDetails[]>([]);

  // Use cached data
  const { data: bookings } = useBookings();
  const { profiles, travels, tickets, buses, locations, routes } = useBookingDetails(bookings || []);

  const fetchData = async () => {
    if (!bookings || !profiles || !travels || !tickets || !buses || !locations || !routes) {
      return;
    }

    setLoading(true);
    try {
      const bookingsWithDetails = await Promise.all(
        bookings.map(async (booking) => {
          // Use cached data when available
          const user_profile = profiles.find(p => p.id === booking.user_id) || 
            (await getProfileById(booking.user_id)) as Profile;
          
          const ticket = tickets.find(t => t.ticket_id === booking.ticket_id) || 
            (await getTicketById(booking.ticket_id)) as TicketType;
          
          const travel = travels.find(t => t.travel_id === ticket.travel_id) || 
            (await getTravelById(ticket.travel_id)) as Travel;
          
          const busId = await getBusIdByTravelId(travel.travel_id);
          const bus = buses.find(b => b.bus_id === busId) || 
            (busId ? (await getBusById(busId)) as any : null);
          const bus_plate = bus?.plate_number || "N/A";
          
          const routeId = await getRouteIdByTravelId(travel.travel_id);
          const route = routes.find(r => r.route_id === routeId);
          const routeLocations = routeId ? await getRouteLocations(routeId) : null;
          
          const departure_name = routeLocations?.startLocationId 
            ? locations.find(l => l.location_id === routeLocations.startLocationId)?.location_name || 
              (await getLocationNameById(routeLocations.startLocationId)) as string
            : "N/A";
          const arrival_name = routeLocations?.endLocationId 
            ? locations.find(l => l.location_id === routeLocations.endLocationId)?.location_name || 
              (await getLocationNameById(routeLocations.endLocationId)) as string
            : "N/A";

          return {
            ...booking,
            user_profile,
            ticket,
            travel,
            bus_plate,
            departure_name,
            arrival_name,
            travel_date: travel.travel_date.toISOString(),
            seat_number: ticket.seat_number,
            price: travel.price,
          };
        })
      );
      setData(bookingsWithDetails);
    } catch (error) {
      console.error("Error fetching booking details:", error);
      toast({
        title: "Error",
        description: "Failed to load booking details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [bookings, profiles, travels, tickets, buses, locations, routes]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Filter by customer name..."
          value={
            (table
              .getColumn("user_profile")
              ?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table
              .getColumn("user_profile")
              ?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="flex items-center gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={fetchData}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reload bookings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No bookings found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
} 
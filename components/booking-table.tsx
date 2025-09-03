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
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [loading, setLoading] = React.useState<boolean>(true);
  const [data, setData] = React.useState<BookingDetails[]>([]);
  const [criticalError, setCriticalError] = React.useState<string | null>(null);

  // Use cached data
  const { data: bookings } = useBookings();
  const { profiles, travels, tickets, buses, locations, routes } = useBookingDetails(bookings || []);

  // Enhanced error logging for SWR hooks
  React.useEffect(() => {
    if (!bookings) console.error("[BookingTable] bookings missing or failed to load");
    if (!profiles) console.error("[BookingTable] profiles missing or failed to load");
    if (!travels) console.error("[BookingTable] travels missing or failed to load");
    if (!tickets) console.error("[BookingTable] tickets missing or failed to load");
    if (!buses) console.error("[BookingTable] buses missing or failed to load");
    if (!locations) console.error("[BookingTable] locations missing or failed to load");
    if (!routes) console.error("[BookingTable] routes missing or failed to load");
  }, [bookings, profiles, travels, tickets, buses, locations, routes]);

  const fetchData = async () => {
    console.log("[BookingTable] fetchData called", {
      bookings: !!bookings,
      profiles: !!profiles,
      travels: !!travels,
      tickets: !!tickets,
      buses: !!buses,
      locations: !!locations,
      routes: !!routes,
      bookingsLength: bookings?.length || 0
    });

    // If any required data is missing, show error and do not proceed
    if (!bookings || !profiles || !travels || !tickets || !buses || !locations || !routes) {
      const missingData = [];
      if (!bookings) missingData.push('bookings');
      if (!profiles) missingData.push('profiles');
      if (!travels) missingData.push('travels');
      if (!tickets) missingData.push('tickets');
      if (!buses) missingData.push('buses');
      if (!locations) missingData.push('locations');
      if (!routes) missingData.push('routes');
      
      console.error("[BookingTable] Missing required data:", missingData);
      setCriticalError(`Failed to load required datasets: ${missingData.join(', ')}. Check network/cache.`);
      setLoading(false);
      toast({
        title: "Error",
        description: `Failed to load booking details (missing: ${missingData.join(', ')})`,
        variant: "destructive",
      });
      return;
    }

    setCriticalError(null);
    setLoading(true);
    
    try {
      console.log("[BookingTable] Processing bookings:", bookings.length);
      
      const bookingsWithDetails = await Promise.all(
        bookings.map(async (booking, index) => {
          try {
            console.log(`[BookingTable] Processing booking ${index + 1}/${bookings.length}:`, booking.booking_id);
            
            // Use cached data when available with null checks
            let user_profile = profiles.find(p => p.id === booking.user_id);
            if (!user_profile) {
              console.log(`[BookingTable] Fetching profile for user: ${booking.user_id}`);
              user_profile = await getProfileById(booking.user_id) as Profile;
              if (!user_profile) {
                console.warn(`[BookingTable] No profile found for user: ${booking.user_id}`);
                user_profile = { id: booking.user_id, first_name: "Unknown", last_name: "User" } as Profile;
              }
            }
            
            let ticket = tickets.find(t => t.ticket_id === booking.ticket_id);
            if (!ticket) {
              console.log(`[BookingTable] Fetching ticket: ${booking.ticket_id}`);
              ticket = await getTicketById(booking.ticket_id) as TicketType;
              if (!ticket) {
                console.error(`[BookingTable] No ticket found for booking: ${booking.booking_id}`);
                return null; // Skip this booking if ticket is missing
              }
            }
            
            // Ensure ticket has travel_id before proceeding
            if (!ticket.travel_id) {
              console.error(`[BookingTable] Ticket ${ticket.ticket_id} missing travel_id`);
              return null;
            }
            
            let travel = travels.find(t => t.travel_id === ticket.travel_id);
            if (!travel) {
              console.log(`[BookingTable] Fetching travel: ${ticket.travel_id}`);
              travel = await getTravelById(ticket.travel_id) as Travel;
              if (!travel) {
                console.error(`[BookingTable] No travel found for ticket: ${ticket.ticket_id}`);
                return null;
              }
            }
            
            // Get bus information with proper error handling
            let bus_plate = "N/A";
            try {
              const busId = await getBusIdByTravelId(travel.travel_id);
              if (busId) {
                const bus = buses.find(b => b.bus_id === busId) || (await getBusById(busId));
                bus_plate = bus?.plate_number || "N/A";
              }
            } catch (error) {
              console.warn(`[BookingTable] Error fetching bus for travel ${travel.travel_id}:`, error);
            }
            
            // Get route and location information with proper error handling
            let departure_name = "N/A";
            let arrival_name = "N/A";
            
            try {
              const routeId = await getRouteIdByTravelId(travel.travel_id);
              if (routeId) {
                const routeLocations = await getRouteLocations(routeId);
                if (routeLocations) {
                  // Get departure location
                  if (routeLocations.startLocationId) {
                    const departureLocation = locations.find(l => l.location_id === routeLocations.startLocationId);
                    if (departureLocation) {
                      departure_name = departureLocation.location_name;
                    } else {
                      const locationName = await getLocationNameById(routeLocations.startLocationId);
                      departure_name = locationName || "Unknown";
                    }
                  }
                  
                  // Get arrival location
                  if (routeLocations.endLocationId) {
                    const arrivalLocation = locations.find(l => l.location_id === routeLocations.endLocationId);
                    if (arrivalLocation) {
                      arrival_name = arrivalLocation.location_name;
                    } else {
                      const locationName = await getLocationNameById(routeLocations.endLocationId);
                      arrival_name = locationName || "Unknown";
                    }
                  }
                }
              }
            } catch (error) {
              console.warn(`[BookingTable] Error fetching route/location for travel ${travel.travel_id}:`, error);
            }

            const result = {
              ...booking,
              user_profile,
              ticket,
              travel,
              bus_plate,
              departure_name,
              arrival_name,
              travel_date: String(travel.travel_date),
              seat_number: ticket.seat_number || 0,
              price: travel.price || 0,
            };
            
            console.log(`[BookingTable] Successfully processed booking ${booking.booking_id}`);
            return result;
            
          } catch (error) {
            console.error(`[BookingTable] Error processing booking ${booking.booking_id}:`, error);
            return null; // Skip this booking on error
          }
        })
      );
      
      // Filter out null results (failed bookings)
      const validBookings = bookingsWithDetails.filter(booking => booking !== null);
      console.log(`[BookingTable] Successfully processed ${validBookings.length}/${bookings.length} bookings`);
      
      setData(validBookings);
    } catch (error) {
      console.error("[BookingTable] Critical error in fetchData:", error);
      setCriticalError("Failed to process booking details. See console for details.");
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
    // Only fetch data when all required data is available
    if (bookings && profiles && travels && tickets && buses && locations && routes) {
      console.log("[BookingTable] All dependencies loaded, starting fetchData");
      fetchData();
    } else {
      console.log("[BookingTable] Waiting for dependencies to load...");
    }
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

  if (criticalError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">{criticalError}</div>
          <div className="text-muted-foreground">Please try refreshing the page or check your network/cache.</div>
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
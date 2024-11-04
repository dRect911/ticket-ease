import React, { useEffect, useState } from "react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Travel, Ticket } from "@/types"; // Import your types
import {
  createBooking,
  getTicketsByTravelId,
  getUser,
  updateTicket,
} from "@/utils/supabase/queries";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/components/ui/use-toast";

// Props for the component, passing in travel details
interface BookTicketProps {
  travel: Travel;
}

const BookTicket: React.FC<BookTicketProps> = ({ travel }) => {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch tickets when the sheet opens
  useEffect(() => {
    const fetchTickets = async () => {
      setIsLoading(true);
      setError(null);

      const ticketsData = await getTicketsByTravelId(travel.travel_id);
      if (ticketsData) {
        // Filter tickets to show only available ones
        setTickets(
          ticketsData.filter((ticket) => ticket.status === "available")
        );
      } else {
        setError("Failed to load tickets.");
      }

      setIsLoading(false);
    };

    fetchTickets();
  }, [travel.travel_id]);

  // Handle booking action
  const handleBooking = async (ticket: Ticket) => {
    try {
      const user = (await getUser()) as User;
      const newBooking = {
        booking_id: crypto.randomUUID(), // Generate a unique ID for the booking
        user_id: user.id,
        ticket_id: ticket.ticket_id,
        booking_date: new Date(),
      };

      const result = await createBooking(newBooking);
      if (result) {
        setTickets((prevTickets) =>
          prevTickets.filter((t) => t.ticket_id !== ticket.ticket_id)
        );
        // Update the ticket associated with this booking
        const updatedTicket = await updateTicket({
          ...ticket, // Assuming `newBooking` contains a `ticket` field with ticket details
          status: "booked", // Set the desired status
        });

        if (updatedTicket) {
          toast({
            title: "Ticket updated",
            description: "Ticket status updated successfully.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Failed to update ticket status",
            description: "Ticket status could not be updated.",
          });
        }
        toast({
          title: "Booking Successful",
          description: `Seat #${ticket.seat_number} booked successfully.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Booking Failed",
          description: "Failed to book the ticket. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while booking the ticket.",
      });
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Book Tickets</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Available Tickets</SheetTitle>
          <SheetDescription>
            Select an available ticket to book.
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <p>Loading tickets...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="space-y-4">
            {tickets.length > 0 ? (
              tickets.map((ticket) => (
                <div
                  key={ticket.ticket_id}
                  className="flex items-center justify-between border-b py-2"
                >
                  <p>Seat #{ticket.seat_number}</p>
                  <Button
                    variant="outline"
                    onClick={() => handleBooking(ticket)}
                  >
                    Book Now
                  </Button>
                </div>
              ))
            ) : (
              <p>No available tickets for this travel.</p>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default BookTicket;

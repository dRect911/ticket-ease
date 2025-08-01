import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Lock, 
  CheckCircle2, 
  Loader2,
  Calendar,
  MapPin,
  User,
  Bus,
  DollarSign
} from "lucide-react";
import { createTicket, createBooking, getUser, getTicketsByTravelId, updateTicket } from "@/utils/supabase/queries";
import { useToast } from "@/components/ui/use-toast";

interface Travel {
  travel_id: string;
  travel_date: string | Date;
  price: number;
  bus_id: string;
  route_id: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  travel: Travel;
  seatNumber: number;
  onPaymentSuccess: () => void;
}

interface PaymentForm {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
}

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  travel, 
  seatNumber, 
  onPaymentSuccess 
}: PaymentModalProps) {
  const [paymentForm, setPaymentForm] = useState<PaymentForm>({
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState<string>("");
  const { toast } = useToast();

  const handleInputChange = (field: keyof PaymentForm, value: string) => {
    setPaymentForm(prev => ({ ...prev, [field]: value }));
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Get current user
      const user = await getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Get existing ticket for the selected seat
      const existingTickets = await getTicketsByTravelId(travel.travel_id);
      if (!existingTickets) {
        throw new Error("Failed to fetch tickets for this travel");
      }

      // Find the ticket for the selected seat
      const ticketForSeat = existingTickets.find(ticket => ticket.seat_number === seatNumber);
      if (!ticketForSeat) {
        throw new Error(`No ticket found for seat ${seatNumber}`);
      }

      // Update the ticket status to "booked"
      const updatedTicket = await updateTicket({
        ...ticketForSeat,
        status: "booked" as const,
      });

      if (!updatedTicket) {
        throw new Error("Failed to update ticket status");
      }

      // Create booking
      const bookingData = {
        booking_id: crypto.randomUUID(),
        user_id: user.id,
        ticket_id: updatedTicket.ticket_id,
        booking_date: new Date(),
      };

      const booking = await createBooking(bookingData);
      if (!booking) {
        throw new Error("Failed to create booking");
      }

      // Handle both return types (true or Booking object)
      const bookingId = typeof booking === 'object' ? booking.booking_id : bookingData.booking_id;

      setIsProcessing(false);
      setIsSuccess(true);
      setCreatedBookingId(bookingId);

      // Show success toast
      toast({
        title: "Booking Confirmed! 🎉",
        description: `Your seat ${seatNumber} has been successfully booked. Booking ID: ${bookingId}`,
      });

      // Auto close after showing success
      setTimeout(() => {
        onPaymentSuccess();
        onClose();
        setIsSuccess(false);
        setPaymentForm({
          cardNumber: "",
          cardHolder: "",
          expiryDate: "",
          cvv: "",
        });
      }, 3000);

    } catch (error) {
      console.error("Error creating booking:", error);
      setIsProcessing(false);
      
      toast({
        title: "Booking Failed",
        description: error instanceof Error ? error.message : "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isFormValid = () => {
    return (
      paymentForm.cardNumber.replace(/\s/g, "").length === 16 &&
      paymentForm.cardHolder.length > 0 &&
      paymentForm.expiryDate.length === 5 &&
      paymentForm.cvv.length === 3
    );
  };

  const formatTravelDate = (date: string | Date) => {
    if (typeof date === 'string') {
      return new Date(date).toLocaleDateString();
    }
    return date.toLocaleDateString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            Complete Your Booking
          </DialogTitle>
          <DialogDescription>
            Enter your payment details to confirm your seat booking
          </DialogDescription>
        </DialogHeader>

        {!isSuccess ? (
          <div className="space-y-6">
            {/* Booking Summary */}
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Travel Date</span>
                    </div>
                    <span className="font-medium">
                      {formatTravelDate(travel.travel_date)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Seat Number</span>
                    </div>
                    <Badge variant="secondary">{seatNumber}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Total Amount</span>
                    </div>
                    <span className="font-bold text-lg text-green-600">
                      {travel.price.toLocaleString()} XOF
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="cardNumber"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={paymentForm.cardNumber}
                    onChange={(e) => handleInputChange("cardNumber", formatCardNumber(e.target.value))}
                    className="pl-10"
                    maxLength={19}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardHolder">Cardholder Name</Label>
                <Input
                  id="cardHolder"
                  type="text"
                  placeholder="John Doe"
                  value={paymentForm.cardHolder}
                  onChange={(e) => handleInputChange("cardHolder", e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    type="text"
                    placeholder="MM/YY"
                    value={paymentForm.expiryDate}
                    onChange={(e) => handleInputChange("expiryDate", formatExpiryDate(e.target.value))}
                    maxLength={5}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    type="text"
                    placeholder="123"
                    value={paymentForm.cvv}
                    onChange={(e) => handleInputChange("cvv", e.target.value.replace(/\D/g, ""))}
                    maxLength={3}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Lock className="h-4 w-4" />
                <span>Your payment information is secure and encrypted</span>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={!isFormValid() || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay {travel.price.toLocaleString()} XOF
                  </>
                )}
              </Button>
            </form>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Payment Successful!
            </h3>
            <p className="text-gray-600 mb-4">
              Your booking has been confirmed. You will receive a confirmation email shortly.
            </p>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Booking ID:</span>
                <span className="font-mono text-sm font-medium">
                  {createdBookingId}
                </span>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 
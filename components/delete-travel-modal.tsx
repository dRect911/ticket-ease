"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2 } from "lucide-react";
import { deleteTravel } from "@/utils/supabase/queries";
import { useToast } from "./ui/use-toast";

interface DeleteTravelModalProps {
  isOpen: boolean;
  onClose: () => void;
  travelId: string;
  travelDetails: {
    departure_name: string;
    arrival_name: string;
    travel_date: string;
    bus_plate: string;
  };
  onSuccess: () => void;
}

export default function DeleteTravelModal({
  isOpen,
  onClose,
  travelId,
  travelDetails,
  onSuccess,
}: DeleteTravelModalProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const deleted = await deleteTravel(travelId);
      if (deleted) {
        toast({
          title: "Travel deleted successfully",
          description: "The travel and all related bookings have been removed.",
        });
        onSuccess();
        onClose();
      } else {
        toast({
          title: "Error deleting travel",
          description: "Failed to delete the travel. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting travel:", error);
      toast({
        title: "Error deleting travel",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Delete Travel
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              Are you sure you want to delete this travel? This action cannot be undone.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
              <p className="text-sm font-medium text-red-800">
                ⚠️ This will also delete:
              </p>
              <ul className="text-sm text-red-700 space-y-1 ml-4">
                <li>• All tickets for this travel</li>
                <li>• All bookings associated with this travel</li>
                <li>• All customer reservations</li>
              </ul>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-800 mb-2">Travel Details:</p>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Route:</strong> {travelDetails.departure_name} → {travelDetails.arrival_name}</p>
                <p><strong>Date:</strong> {new Date(travelDetails.travel_date).toLocaleDateString()}</p>
                <p><strong>Bus:</strong> {travelDetails.bus_plate}</p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Travel
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 
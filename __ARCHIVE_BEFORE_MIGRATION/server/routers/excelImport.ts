import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import * as XLSX from "xlsx";
import * as reservationDb from "../reservationDb";

export const excelImportRouter = router({
  // Import reservations from Excel file
  importReservations: protectedProcedure
    .input(
      z.object({
        fileUrl: z.string().url(),
        fileName: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Fetch file from S3
        const response = await fetch(input.fileUrl);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Parse Excel
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const data: any[] = XLSX.utils.sheet_to_json(worksheet);

        const results = {
          success: 0,
          failed: 0,
          duplicates: 0,
          errors: [] as string[],
        };

        // Process each row
        for (const row of data) {
          try {
            // Map Excel columns to reservation fields
            // Adjust these mappings based on actual OTELMS export format
            const bookingId = row["Booking ID"] || row["ID"] || row["booking_id"] || String(row["№"]);
            const guestName = row["Guest Name"] || row["Name"] || row["guest_name"] || row["სტუმარი"];
            const checkIn = row["Check-in"] || row["Check In"] || row["check_in"] || row["შემოსვლა"];
            const checkOut = row["Check-out"] || row["Check Out"] || row["check_out"] || row["გასვლა"];
            const roomNumber = row["Room"] || row["Room Number"] || row["room"] || row["ოთახი"];
            const price = row["Price"] || row["Total"] || row["price"] || row["ფასი"];
            const channel = row["Channel"] || row["Source"] || row["channel"] || row["არხი"];
            const status = row["Status"] || row["status"] || row["სტატუსი"] || "confirmed";
            const guestEmail = row["Email"] || row["email"] || row["ელ-ფოსტა"];
            const guestPhone = row["Phone"] || row["phone"] || row["ტელეფონი"];

            if (!bookingId || !guestName || !checkIn || !checkOut) {
              results.failed++;
              results.errors.push(`Row ${data.indexOf(row) + 2}: Missing required fields`);
              continue;
            }

            // Check if booking already exists
            const existing = await reservationDb.getReservationByBookingId(String(bookingId));
            if (existing) {
              results.duplicates++;
              continue;
            }

            // Parse dates
            let checkInDate: Date;
            let checkOutDate: Date;

            try {
              // Handle Excel date serial numbers
              if (typeof checkIn === "number") {
                const parsedCheckIn: any = XLSX.SSF.parse_date_code(checkIn);
                checkInDate = new Date(parsedCheckIn.y, parsedCheckIn.m - 1, parsedCheckIn.d);
              } else {
                checkInDate = new Date(checkIn);
              }

              if (typeof checkOut === "number") {
                const parsedCheckOut: any = XLSX.SSF.parse_date_code(checkOut);
                checkOutDate = new Date(parsedCheckOut.y, parsedCheckOut.m - 1, parsedCheckOut.d);
              } else {
                checkOutDate = new Date(checkOut);
              }
            } catch (e) {
              results.failed++;
              results.errors.push(`Row ${data.indexOf(row) + 2}: Invalid date format`);
              continue;
            }

            // Map channel names
            let channelMapped: any = "Other";
            const channelLower = String(channel).toLowerCase();
            if (channelLower.includes("booking")) channelMapped = "Booking.com";
            else if (channelLower.includes("airbnb")) channelMapped = "Airbnb";
            else if (channelLower.includes("expedia")) channelMapped = "Expedia";
            else if (channelLower.includes("agoda")) channelMapped = "Agoda";
            else if (channelLower.includes("direct") || channelLower.includes("პირდაპირი")) channelMapped = "Direct";

            // Parse price
            let priceInt: number | undefined;
            if (price) {
              const priceStr = String(price).replace(/[^\d.]/g, "");
              const priceFloat = parseFloat(priceStr);
              if (!isNaN(priceFloat)) {
                priceInt = Math.round(priceFloat * 100); // Convert to cents
              }
            }

            // Map status
            let statusMapped: any = "confirmed";
            const statusLower = String(status).toLowerCase();
            if (statusLower.includes("pending") || statusLower.includes("მოლოდინში")) statusMapped = "pending";
            else if (statusLower.includes("cancelled") || statusLower.includes("გაუქმებული")) statusMapped = "cancelled";
            else if (statusLower.includes("checked-in") || statusLower.includes("დაბინავებული")) statusMapped = "checked-in";
            else if (statusLower.includes("checked-out") || statusLower.includes("გასული")) statusMapped = "checked-out";

            // Create reservation
            await reservationDb.createReservation({
              guestName: String(guestName),
              checkIn: checkInDate,
              checkOut: checkOutDate,
              roomNumber: roomNumber ? String(roomNumber) : undefined,
              price: priceInt,
              currency: "GEL",
              channel: channelMapped,
              bookingId: String(bookingId),
              status: statusMapped,
              guestEmail: guestEmail ? String(guestEmail) : undefined,
              guestPhone: guestPhone ? String(guestPhone) : undefined,
              source: "excel",
            });

            results.success++;
          } catch (error: any) {
            results.failed++;
            results.errors.push(`Row ${data.indexOf(row) + 2}: ${error.message}`);
          }
        }

        return {
          success: true,
          results,
          message: `Imported ${results.success} reservations. ${results.duplicates} duplicates skipped. ${results.failed} failed.`,
        };
      } catch (error: any) {
        console.error("[Excel Import] Error:", error);
        throw new Error(`Failed to import Excel file: ${error.message}`);
      }
    }),
});

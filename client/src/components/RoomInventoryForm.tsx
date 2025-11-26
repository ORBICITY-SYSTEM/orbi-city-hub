import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const formSchema = z.object({
  change_type: z.string().min(1, "აირჩიეთ ცვლილების ტიპი").max(100, "ტიპი ძალიან გრძელია"),
  items_missing: z.string().max(1000, "ტექსტი არ უნდა აღემატებოდეს 1000 სიმბოლოს").optional(),
  items_added: z.string().max(1000, "ტექსტი არ უნდა აღემატებოდეს 1000 სიმბოლოს").optional(),
  items_removed: z.string().max(1000, "ტექსტი არ უნდა აღემატებოდეს 1000 სიმბოლოს").optional(),
  transfer_from_room: z.string().max(50, "ოთახის ნომერი ძალიან გრძელია").optional(),
  transfer_to_room: z.string().max(50, "ოთახის ნომერი ძალიან გრძელია").optional(),
  notes: z.string().max(2000, "შენიშვნები არ უნდა აღემატებოდეს 2000 სიმბოლოს").optional(),
});

interface RoomInventoryFormProps {
  roomId: string;
  onClose: () => void;
}

export const RoomInventoryForm = ({ roomId, onClose }: RoomInventoryFormProps) => {
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      change_type: "",
      items_missing: "",
      items_added: "",
      items_removed: "",
      transfer_from_room: "",
      transfer_to_room: "",
      notes: "",
    },
  });

  const createDescriptionMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("room_inventory_descriptions")
        .insert({
          room_id: roomId,
          user_id: user.id,
          ...values,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["latest-description", roomId] });
      queryClient.invalidateQueries({ queryKey: ["room-history", roomId] });
      toast.success("აღწერა წარმატებით დაემატა");
      onClose();
    },
    onError: () => {
      toast.error("შეცდომა აღწერის დამატებისას");
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createDescriptionMutation.mutate(values);
  };

  const changeType = form.watch("change_type");

  return (
    <Card>
      <CardHeader>
        <CardTitle>ოთახის აღწერა</CardTitle>
        <CardDescription>შეავსეთ ინფორმაცია ოთახის მიმდინარე მდგომარეობის შესახებ</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="change_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ცვლილების ტიპი</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="აირჩიეთ ტიპი" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="რეგულარული აღწერა">რეგულარული აღწერა</SelectItem>
                      <SelectItem value="შეცვლა/გატეხვა">შეცვლა/გატეხვა</SelectItem>
                      <SelectItem value="დაკარგვა">დაკარგვა</SelectItem>
                      <SelectItem value="ნომრიდან ნომერში გადატანა">ნომრიდან ნომერში გადატანა</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="items_missing"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>რა აკლია (-)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="მაგ: ბარდა 1 ცალი, პირსახოცი 2 ცალი"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="items_added"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>რა დაემატა (+)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="მაგ: ახალი ტელევიზორი, ახალი პირსახოცები 4 ცალი"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="items_removed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>რა წაიღეს/გადაიტანეს</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="მაგ: ძველი ტელევიზორი, გაფუჭებული კარადა"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {changeType === "ნომრიდან ნომერში გადატანა" && (
              <>
                <FormField
                  control={form.control}
                  name="transfer_from_room"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>საიდან გადაიტანა</FormLabel>
                      <FormControl>
                        <Input placeholder="ოთახის ნომერი" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="transfer_to_room"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>სად გადაიტანა</FormLabel>
                      <FormControl>
                        <Input placeholder="ოთახის ნომერი" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>დამატებითი შენიშვნები</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="ნებისმიერი დამატებითი ინფორმაცია..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <Button type="submit" disabled={createDescriptionMutation.isPending}>
                {createDescriptionMutation.isPending ? "დამატება..." : "დამატება"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                გაუქმება
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
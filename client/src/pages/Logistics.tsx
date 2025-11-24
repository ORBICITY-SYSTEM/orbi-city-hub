import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Sparkles, Wrench, ShoppingCart, Users } from "lucide-react";


const Logistics = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
            <Package className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              ლოგისტიკა
            </h1>
            <p className="text-sm text-muted-foreground">
              ინვენტარი, დასუფთავება და ტექნიკური მოვლა
            </p>
          </div>
        </div>
      </div>

      {/* Sub-Modules Tabs */}
      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            ინვენტარი
          </TabsTrigger>
          <TabsTrigger value="housekeeping" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            დასუფთავება
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            ტექნიკური მოვლა
          </TabsTrigger>
          <TabsTrigger value="supplies" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            მარაგები
          </TabsTrigger>
          <TabsTrigger value="staff" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            პერსონალი
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>ინვენტარის მართვა</CardTitle>
              <CardDescription>მარაგების თვალყურის დევნება და მართვა</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                აქ იქნება ინვენტარის სრული სისტემა - ყველა 60 სტუდიოს ინვენტარი, დაბალი მარაგის შეტყობინებები, და ავტომატური შეკვეთები.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="housekeeping">
          <Card>
            <CardHeader>
              <CardTitle>დასუფთავების მართვა</CardTitle>
              <CardDescription>დასუფთავების გრაფიკები და ამოცანები</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                აქ იქნება დასუფთავების სრული სისტემა - დღიური გრაფიკები, პერსონალის დანიშვნები, და ხარისხის კონტროლი.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle>ტექნიკური მოვლა</CardTitle>
              <CardDescription>რემონტისა და მოვლის თვალყურის დევნება</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                აქ იქნება ტექნიკური მოვლის სისტემა - პრობლემების რეგისტრაცია, რემონტის გრაფიკები, და ხარჯების აღრიცხვა.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="supplies">
          <Card>
            <CardHeader>
              <CardTitle>მარაგების მართვა</CardTitle>
              <CardDescription>მარაგების შეკვეთა და მართვა</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                აქ იქნება მარაგების სისტემა - ავტომატური შეკვეთები, მომწოდებლების მართვა, და ხარჯების ოპტიმიზაცია.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff">
          <Card>
            <CardHeader>
              <CardTitle>პერსონალის მართვა</CardTitle>
              <CardDescription>პერსონალის გრაფიკი და დავალებები</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                აქ იქნება პერსონალის სისტემა - სამუშაო გრაფიკები, დავალებების განაწილება, და შესრულების თვალყურის დევნება.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>


    </div>
  );
};

export default Logistics;

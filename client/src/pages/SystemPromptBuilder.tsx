import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Sparkles, Save, Copy, Trash2 } from "lucide-react";

export default function SystemPromptBuilder() {
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    hotelName: "",
    identity: "",
    services: "",
    communicationStyle: "",
    restrictions: "",
  });

  const { data: savedPrompts = [], refetch } = trpc.systemPrompts.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createPrompt = trpc.systemPrompts.create.useMutation({
    onSuccess: () => {
      toast.success("სისტემური პრომპტი შენახულია!");
      refetch();
      setFormData({
        name: "",
        hotelName: "",
        identity: "",
        services: "",
        communicationStyle: "",
        restrictions: "",
      });
    },
  });

  const deletePrompt = trpc.systemPrompts.delete.useMutation({
    onSuccess: () => {
      toast.success("სისტემური პრომპტი წაშლილია!");
      refetch();
    },
  });

  const generateFullPrompt = () => {
    return `თქვენ ხართ "${formData.hotelName || "[სასტუმროს სახელი]"}" აპარტჰოტელის ვირტუალური ასისტენტი.

იდენტობა:
${formData.identity || "[აღწერეთ ბოტის იდენტობა და როლი]"}

სერვისები და ინფორმაცია:
${formData.services || "[ჩამოთვალეთ ყველა სერვისი, ფასები, ნომრების ტიპები და სხვა დეტალები]"}

კომუნიკაციის სტილი:
${formData.communicationStyle || "[აღწერეთ როგორ უნდა ურთიერთობდეს ბოტი მომხმარებლებთან]"}

შეზღუდვები:
${formData.restrictions || "[ჩამოთვალეთ რა არ უნდა გააკეთოს ბოტმა]"}`;
  };

  const handleSave = () => {
    if (!isAuthenticated) {
      toast.error("შესვლა საჭიროა!");
      return;
    }

    if (!formData.name || !formData.hotelName) {
      toast.error("გთხოვთ შეავსოთ სავალდებულო ველები!");
      return;
    }

    createPrompt.mutate({
      ...formData,
      fullPrompt: generateFullPrompt(),
      isActive: false,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("დაკოპირებულია!");
  };

  const loadPrompt = (prompt: any) => {
    setFormData({
      name: prompt.name,
      hotelName: prompt.hotelName || "",
      identity: prompt.identity || "",
      services: prompt.services || "",
      communicationStyle: prompt.communicationStyle || "",
      restrictions: prompt.restrictions || "",
    });
    toast.success("პრომპტი ჩაიტვირთა!");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary">
        <Card className="max-w-md w-full shadow-elegant">
          <CardHeader>
            <CardTitle>შესვლა საჭიროა</CardTitle>
            <CardDescription>
              სისტემური პრომპტის შესაქმნელად გთხოვთ შეხვიდეთ სისტემაში
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href={getLoginUrl()}>შესვლა</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary py-12">
      <div className="container max-w-6xl">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">
            სისტემური პრომპტის შემქმნელი
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            შექმენით პერსონალიზებული სისტემური პრომპტი თქვენი ბიზნესისთვის
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  პრომპტის პარამეტრები
                </CardTitle>
                <CardDescription>
                  შეავსეთ ველები თქვენი სასტუმროს ინფორმაციით
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">პრომპტის სახელი *</Label>
                  <Input
                    id="name"
                    placeholder="მაგ: ორბი სითი - მთავარი პრომპტი"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hotelName">სასტუმროს სახელი *</Label>
                  <Input
                    id="hotelName"
                    placeholder="მაგ: ორბი სითი"
                    value={formData.hotelName}
                    onChange={(e) => setFormData({ ...formData, hotelName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="identity">იდენტობა</Label>
                  <Textarea
                    id="identity"
                    placeholder="აღწერეთ ბოტის როლი და პიროვნება..."
                    rows={3}
                    value={formData.identity}
                    onChange={(e) => setFormData({ ...formData, identity: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="services">სერვისები და ინფორმაცია</Label>
                  <Textarea
                    id="services"
                    placeholder="ჩამოთვალეთ ყველა სერვისი, ფასები, ნომრების ტიპები..."
                    rows={5}
                    value={formData.services}
                    onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="communicationStyle">კომუნიკაციის სტილი</Label>
                  <Textarea
                    id="communicationStyle"
                    placeholder="როგორ უნდა ურთიერთობდეს ბოტი მომხმარებლებთან..."
                    rows={3}
                    value={formData.communicationStyle}
                    onChange={(e) => setFormData({ ...formData, communicationStyle: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="restrictions">შეზღუდვები</Label>
                  <Textarea
                    id="restrictions"
                    placeholder="რა არ უნდა გააკეთოს ბოტმა..."
                    rows={3}
                    value={formData.restrictions}
                    onChange={(e) => setFormData({ ...formData, restrictions: e.target.value })}
                  />
                </div>

                <Button onClick={handleSave} className="w-full" disabled={createPrompt.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  შენახვა
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Preview & Saved Prompts */}
          <div className="space-y-6">
            {/* Preview */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>წინასწარი ხედვა</CardTitle>
                <CardDescription>გენერირებული სისტემური პრომპტი</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <pre className="bg-secondary p-4 rounded-lg text-xs overflow-x-auto max-h-96">
                    {generateFullPrompt()}
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(generateFullPrompt())}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Saved Prompts */}
            {savedPrompts.length > 0 && (
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle>შენახული პრომპტები</CardTitle>
                  <CardDescription>{savedPrompts.length} პრომპტი</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {savedPrompts.map((prompt) => (
                    <div
                      key={prompt.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex-1 cursor-pointer" onClick={() => loadPrompt(prompt)}>
                        <p className="font-medium text-sm">{prompt.name}</p>
                        <p className="text-xs text-muted-foreground">{prompt.hotelName}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deletePrompt.mutate({ id: prompt.id })}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

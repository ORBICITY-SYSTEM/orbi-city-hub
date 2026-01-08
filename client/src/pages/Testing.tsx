import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, AlertTriangle, Info, Circle } from "lucide-react";

const testingChecklist = [
  {
    category: "ინფრასტრუქტურის ტესტირება",
    tests: [
      { name: "Google Cloud პროექტის სტატუსი", status: "required" },
      { name: "Vertex AI API გააქტიურება", status: "required" },
      { name: "სერვისის ანგარიშის უფლებები", status: "required" },
      { name: "JSON გასაღების ვალიდურობა", status: "required" },
      { name: "Meta აპლიკაციის კონფიგურაცია", status: "required" },
      { name: "WhatsApp Business Account დაკავშირება", status: "required" }
    ]
  },
  {
    category: "Apps Script ტესტირება",
    tests: [
      { name: "doPost ფუნქციის შემოწმება", status: "required" },
      { name: "Gemini API კავშირი", status: "required" },
      { name: "WhatsApp API კავშირი", status: "required" },
      { name: "სისტემური პრომპტის ვალიდაცია", status: "required" },
      { name: "შეცდომების მართვა", status: "optional" },
      { name: "ლოგირების სისტემა", status: "optional" }
    ]
  },
  {
    category: "ინტეგრაციის ტესტირება",
    tests: [
      { name: "Webhook URL-ის ვერიფიკაცია", status: "required" },
      { name: "შეტყობინების მიღება WhatsApp-იდან", status: "required" },
      { name: "Gemini პასუხის გენერაცია", status: "required" },
      { name: "პასუხის გაგზავნა WhatsApp-ში", status: "required" },
      { name: "End-to-end ტესტირება", status: "required" }
    ]
  },
  {
    category: "ფუნქციონალური ტესტირება",
    tests: [
      { name: "ჯავშნის ინფორმაციის მოთხოვნა", status: "required" },
      { name: "ფასების შეკითხვა", status: "required" },
      { name: "ხელმისაწვდომობის შემოწმება", status: "required" },
      { name: "მდებარეობის ინფორმაცია", status: "required" },
      { name: "სერვისების შესახებ კითხვები", status: "required" },
      { name: "მრავალენოვანი მხარდაჭერა", status: "optional" }
    ]
  }
];

const troubleshooting = [
  {
    issue: "Gemini API არ პასუხობს",
    severity: "high",
    solutions: [
      "შეამოწმეთ Vertex AI API გააქტიურებულია თუ არა",
      "დარწმუნდით რომ სერვისის ანგარიშს აქვს Vertex AI User როლი",
      "შეამოწმეთ JSON გასაღების ვალიდურობა",
      "გადაამოწმეთ PROJECT_ID და LOCATION პარამეტრები"
    ]
  },
  {
    issue: "WhatsApp შეტყობინებები არ მოდის",
    severity: "high",
    solutions: [
      "შეამოწმეთ Webhook URL სწორად არის კონფიგურირებული",
      "დარწმუნდით რომ Apps Script გამოქვეყნებულია როგორც Web App",
      "გადაამოწმეთ VERIFY_TOKEN სწორია",
      "შეამოწმეთ Meta-ს Webhook სტატუსი"
    ]
  },
  {
    issue: "ბოტი არასწორ პასუხებს გასცემს",
    severity: "medium",
    solutions: [
      "გადახედეთ სისტემურ პრომპტს და დააზუსტეთ ინსტრუქციები",
      "შეამოწმეთ Gemini-ს temperature და maxOutputTokens პარამეტრები",
      "დაამატეთ მეტი კონტექსტი სისტემურ პრომპტში",
      "ჩაატარეთ A/B ტესტირება სხვადასხვა პრომპტებით"
    ]
  },
  {
    issue: "შეტყობინებები ნელა იგზავნება",
    severity: "low",
    solutions: [
      "შეამოწმეთ Apps Script-ის შესრულების დრო",
      "ოპტიმიზაცია გაუკეთეთ API გამოძახებებს",
      "გამოიყენეთ caching სხვადასხვა მონაცემებისთვის",
      "შეამოწმეთ ქსელის კავშირი"
    ]
  },
  {
    issue: "Access Token-ი ვადაგასულია",
    severity: "high",
    solutions: [
      "შექმენით ახალი Permanent Access Token Meta-ზე",
      "განაახლეთ ტოკენი Apps Script Properties-ში",
      "დარწმუნდით რომ ტოკენს აქვს საჭირო უფლებები",
      "გაითვალისწინეთ ტოკენის ვადის გასვლის თარიღი"
    ]
  }
];

export default function Testing() {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "text-red-500";
      case "medium": return "text-orange-500";
      case "low": return "text-yellow-500";
      default: return "text-gray-500";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high": return XCircle;
      case "medium": return AlertTriangle;
      case "low": return Info;
      default: return Info;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12">
      <div className="container max-w-6xl">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">
            ტესტირება და პრობლემების მოგვარება
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            სრული ჩეკლისტი და გადაწყვეტილებები ხშირი პრობლემებისთვის
          </p>
        </div>

        {/* Testing Checklist */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">ტესტირების ჩეკლისტი</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testingChecklist.map((category, idx) => (
              <Card key={idx} className="shadow-elegant">
                <CardHeader>
                  <CardTitle>{category.category}</CardTitle>
                  <CardDescription>
                    {category.tests.length} ტესტი
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {category.tests.map((test, testIdx) => (
                    <div
                      key={testIdx}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Circle className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{test.name}</span>
                      </div>
                      <Badge variant={test.status === "required" ? "default" : "outline"}>
                        {test.status === "required" ? "სავალდებულო" : "არასავალდებულო"}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Troubleshooting */}
        <div>
          <h2 className="text-2xl font-bold mb-6">ხშირი პრობლემები და გადაწყვეტილებები</h2>
          <div className="space-y-6">
            {troubleshooting.map((item, idx) => {
              const SeverityIcon = getSeverityIcon(item.severity);
              
              return (
                <Card key={idx} className="shadow-elegant animate-slide-up" style={{ animationDelay: `${idx * 50}ms` }}>
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <SeverityIcon className={`h-6 w-6 ${getSeverityColor(item.severity)} mt-0.5`} />
                      <div className="flex-1">
                        <CardTitle className="text-lg">{item.issue}</CardTitle>
                        <CardDescription className="mt-1">
                          სიმძიმე: {item.severity === "high" ? "მაღალი" : item.severity === "medium" ? "საშუალო" : "დაბალი"}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Alert>
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertDescription>
                        <div className="font-semibold mb-2">გადაწყვეტილებები:</div>
                        <ul className="space-y-1 ml-4">
                          {item.solutions.map((solution, sIdx) => (
                            <li key={sIdx} className="text-sm list-disc">
                              {solution}
                            </li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

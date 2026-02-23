import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { packages } from "@/config/billing";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const paymentId = searchParams.get("paymentId");

        if (!paymentId) {
            return new NextResponse("Missing paymentId", { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Fetch payment details along with user profile
        const { data: payment, error } = await supabase
            .from("payments")
            .select(`
                *,
                user_profiles (
                    full_name,
                    email
                )
            `)
            .eq("id", paymentId)
            .eq("user_id", user.id) // Ensure they own this payment
            .single();

        if (error || !payment) {
            return new NextResponse("Invoice not found or unauthorized", { status: 404 });
        }

        const customerName = payment.user_profiles?.full_name || user.email?.split("@")[0] || "Customer";
        const customerEmail = payment.user_profiles?.email || user.email || "";
        const amount = payment.amount;
        const currency = "USD"; // Default to USD for now
        const paymentDate = new Date(payment.created_at);
        const invoiceNumber = `INV-${payment.id.substring(0, 8).toUpperCase()}`;

        // Find the friendly plan name
        const pkg = packages[payment.package_id];
        const planName = pkg ? pkg.name : "Premium AI Credits"; // Fallback name

        // Helpers
        const formatCurrency = (amount: number, currency: string) => {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
        };

        const formatDate = (date: Date) => {
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        };

        // Construct HTML String identical to template, replacing data
        const htmlContent = `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SyncFlo AI - Invoice ${invoiceNumber}</title>
    <!-- Load Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Load Inter font -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
        }

        /* Styles for printing */
        @media print {
            body {
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }

            .no-print {
                display: none;
            }

            .print-shadow-none {
                box-shadow: none;
            }
        }
    </style>
</head>

<body class="bg-gray-100 p-4 sm:p-8">

    <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 sm:p-12 print-shadow-none">

        <!-- Header: Logo and Invoice Title -->
        <header class="flex justify-between items-start mb-10">
            <div>
                <img src="/SyncFlo White BG Full.png" alt="SyncFlo AI Logo" class="h-12 bg-black p-2 rounded-lg">
            </div>
            <div class="text-right">
                <h1 class="text-3xl font-bold text-gray-800 uppercase tracking-widest">
                    Invoice
                </h1>
                <p class="text-2xl font-bold text-green-600 uppercase tracking-wide">Paid</p>
            </div>
        </header>

        <!-- Company & Client Details -->
        <section class="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
            <!-- Bill From: SyncFlo AI -->
            <div>
                <h2 class="text-sm font-semibold text-gray-500 uppercase mb-3">From</h2>
                <p class="font-bold text-lg text-gray-900">SyncFlo AI</p>
                <p class="text-gray-600">South City Garden</p>
                <p class="text-gray-600">Kol 700053</p>
                <p class="text-gray-600">contact@syncflo.xyz</p>
            </div>

            <!-- Bill To: Client -->
            <div class="sm:text-right">
                <h2 class="text-sm font-semibold text-gray-500 uppercase mb-3">Bill To</h2>
                <p class="font-bold text-lg text-gray-900">${customerName}</p>
                <p class="text-gray-600">${customerEmail}</p>
            </div>
        </section>

        <!-- Invoice Meta: Number, Date, Due Date -->
        <section class="bg-gray-50 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start gap-4 mb-12">
            <div class="flex-1">
                <p class="text-sm font-semibold text-gray-600 uppercase tracking-wide">Date Paid</p>
                <p class="text-lg text-gray-900 font-bold mt-1">${formatDate(paymentDate)}</p>
            </div>
            <div class="flex-1 sm:text-center">
                <p class="text-sm font-semibold text-gray-600 uppercase tracking-wide">Payment Method</p>
                <p class="text-lg text-gray-900 font-bold mt-1 capitalize">Razorpay</p>
            </div>
            <div class="flex-1 sm:text-right">
                <p class="text-sm font-semibold text-gray-600 uppercase tracking-wide">Invoice Number</p>
                <p class="text-lg text-gray-900 font-bold mt-1">${invoiceNumber}</p>
            </div>
        </section>

        <!-- Line Items Table -->
        <section class="mb-12">
            <div class="overflow-x-auto">
                <table class="w-full min-w-full text-left">
                    <thead class="border-b border-gray-300">
                        <tr>
                            <th scope="col" class="py-3 pr-3 font-semibold text-gray-700 uppercase">Description</th>
                            <th scope="col"
                                class="hidden sm:table-cell py-3 px-3 font-semibold text-gray-700 uppercase text-right">
                                Qty</th>
                            <th scope="col"
                                class="hidden sm:table-cell py-3 px-3 font-semibold text-gray-700 uppercase text-right">
                                Rate</th>
                            <th scope="col" class="py-3 pl-3 font-semibold text-gray-700 uppercase text-right">Amount
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- Main Item -->
                        <tr class="border-b border-gray-200">
                            <td class="py-4 pr-3">
                                <p class="font-medium text-gray-900">${planName}</p>
                                <p class="text-sm text-gray-600">Credits top-up payment</p>
                            </td>
                            <td class="hidden sm:table-cell py-4 px-3 text-gray-700 text-right">1</td>
                            <td class="hidden sm:table-cell py-4 px-3 text-gray-700 text-right">
                                ${formatCurrency(amount, currency)}</td>
                            <td class="py-4 pl-3 text-gray-900 font-medium text-right">
                                ${formatCurrency(amount, currency)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>

        <!-- Totals -->
        <section class="flex justify-end mb-12">
            <div class="w-full max-w-xs">
                <div class="flex justify-between items-center py-2">
                    <span class="text-gray-600">Subtotal</span>
                    <span class="font-medium text-gray-900">${formatCurrency(amount, currency)}</span>
                </div>
                <div class="flex justify-between items-center py-2">
                    <span class="text-gray-600">Tax (0%)</span>
                    <span class="font-medium text-gray-900">$0.00</span>
                </div>
                <div class="flex justify-between items-center py-3 border-t-2 border-gray-300 mt-2">
                    <span class="text-lg font-bold text-gray-900">Amount Paid</span>
                    <span class="text-lg font-bold text-gray-900">${formatCurrency(amount, currency)}</span>
                </div>
            </div>
        </section>

        <!-- Footer: Notes & Payment Terms -->
        <footer class="border-t border-gray-200 pt-8">
            <h3 class="font-semibold text-gray-700 mb-2">Notes</h3>
            <p class="text-gray-600 text-sm mb-4">
                Thank you for your business. This invoice has been paid in full.
            </p>
            <p class="text-gray-600 text-xs">
                Transaction ID: ${paymentId}
            </p>
        </footer>

    </div>

    <!-- Print Button -->
    <div class="max-w-4xl mx-auto mt-6 text-center no-print">
        <button onclick="window.print()"
            class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow transition-colors duration-200">
            Print Invoice
        </button>
    </div>

</body>

</html>
        `;

        return new NextResponse(htmlContent, {
            headers: {
                "Content-Type": "text/html",
                "Cache-Control": "no-store", // Prevents caching of sensitive dynamic invoice
            },
        });
    } catch (error: any) {
        console.error("Generate Invoice Error:", error);
        return new NextResponse("Failed to generate invoice", { status: 500 });
    }
}

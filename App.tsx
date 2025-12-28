import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Save, 
  Trash2, 
  PlusCircle, 
  Printer, 
  Share2, 
  History,
  FileDown,
  FileJson,
  FileType
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Brand, ProfileType, Quote, QuoteItem } from './types';
import Schematic from './components/Schematic';
import { saveQuote, getSavedQuotes, deleteQuote } from './services/storage';

// Constants
const COMPANY_ADDRESS = "WEST CABIN BLOC, DELHI - INDIA 110041";
const DEFAULT_RATE = 590;

const App: React.FC = () => {
  // Navigation State
  const [view, setView] = useState<'calculator' | 'history'>('calculator');
  
  // Calculator State
  const [currentBrand, setCurrentBrand] = useState<Brand>('RENOLX');
  const [currentType, setCurrentType] = useState<ProfileType>(ProfileType.SLIDING_2_TRACK);
  const [width, setWidth] = useState<number | ''>('');
  const [height, setHeight] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [price, setPrice] = useState<number>(DEFAULT_RATE);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');

  // Quote State
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [savedQuotes, setSavedQuotes] = useState<Quote[]>([]);
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);

  useEffect(() => {
    // Load saved quotes on mount
    setSavedQuotes(getSavedQuotes());
  }, []);

  // --- Helpers ---

  const generatePDF = (quote: Quote) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("RENOLX INDIA", 14, 22);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text("Professional UPVC Solutions", 14, 28);
    
    // Company Info
    doc.setFontSize(9);
    doc.text(COMPANY_ADDRESS, 200, 22, { align: "right" });
    doc.text("+91 XXXXX XXXXX", 200, 27, { align: "right" });
    doc.text("info@renolx.in", 200, 32, { align: "right" });

    // Line
    doc.setDrawColor(200);
    doc.line(14, 38, 200, 38);

    // Client Info Box
    doc.setFillColor(247, 250, 252);
    doc.roundedRect(14, 45, 186, 30, 3, 3, "F");
    
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("QUOTATION FOR", 20, 52);
    
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text(quote.clientName, 20, 59);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(quote.clientPhone, 20, 65);

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Date: ${quote.date}`, 190, 52, { align: "right" });
    doc.text(`ID: ${quote.id.slice(0,8)}`, 190, 58, { align: "right" });

    // Table
    const tableData = quote.items.map(item => [
      item.itemNumber,
      `${item.brand} - ${item.type}\n@ ${item.pricePerSqFt}/sq.ft`,
      `${item.width} x ${item.height} mm\nArea: ${item.sqFt} sq.ft`,
      item.quantity,
      `Rs. ${item.totalPrice.toLocaleString()}`
    ]);

    autoTable(doc, {
      startY: 85,
      head: [['#', 'Description', 'Dimensions', 'Qty', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59], textColor: 255 }, // Slate 900
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 40 },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
      },
      styles: { fontSize: 9, cellPadding: 4 },
      foot: [['', '', '', 'Grand Total', `Rs. ${quote.totalAmount.toLocaleString()}`]],
      footStyles: { fillColor: [241, 245, 249], textColor: [0,0,0], fontStyle: 'bold', halign: 'right' }
    });

    // Footer
    const finalY = (doc as any).lastAutoTable.finalY || 150;
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("This is a computer generated quotation. Thank you for your business.", 105, finalY + 20, { align: "center" });

    return doc;
  };

  const generateQuoteHTML = (quote: Quote) => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Quote - ${quote.clientName}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1a202c; max-width: 800px; margin: 0 auto; background: white; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #1a202c; padding-bottom: 20px; margin-bottom: 30px; }
          .brand { font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
          .sub { font-size: 14px; color: #718096; margin-top: 5px; }
          .meta { text-align: right; font-size: 14px; color: #4a5568; }
          .client-box { background: #f7fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #e2e8f0; }
          .client-title { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #a0aec0; font-weight: bold; margin-bottom: 5px; }
          .client-name { font-size: 20px; font-weight: bold; color: #2d3748; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { text-align: left; border-bottom: 2px solid #e2e8f0; padding: 12px; font-size: 12px; text-transform: uppercase; color: #718096; }
          td { border-bottom: 1px solid #e2e8f0; padding: 16px 12px; vertical-align: top; }
          .item-meta { font-size: 13px; color: #718096; margin-top: 4px; }
          .total-box { margin-top: 40px; text-align: right; }
          .grand-total { font-size: 32px; font-weight: 800; color: #2d3748; }
          .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #a0aec0; font-size: 12px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">RENOLX INDIA</div>
            <div class="sub">Professional UPVC Solutions</div>
          </div>
          <div class="meta">
            <div>${COMPANY_ADDRESS}</div>
            <div>+91 XXXXX XXXXX</div>
            <div>info@renolx.in</div>
          </div>
        </div>

        <div class="client-box">
          <div class="client-title">Quotation For</div>
          <div class="client-name">${quote.clientName}</div>
          <div>${quote.clientPhone}</div>
          <div style="margin-top: 10px; font-size: 14px; color: #718096;">Date: ${quote.date} • ID: ${quote.id.slice(0,8)}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th width="5%">#</th>
              <th width="40%">Description</th>
              <th width="20%">Dimensions</th>
              <th width="10%" style="text-align:center">Qty</th>
              <th width="25%" style="text-align:right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${quote.items.map(item => `
              <tr>
                <td style="color:#a0aec0">${item.itemNumber}</td>
                <td>
                  <strong>${item.brand}</strong> ${item.type}
                  <div class="item-meta">@ ₹${item.pricePerSqFt}/sq.ft</div>
                </td>
                <td>
                  ${item.width} x ${item.height} mm
                  <div class="item-meta">${item.sqFt} Sq.Ft</div>
                </td>
                <td style="text-align:center">${item.quantity}</td>
                <td style="text-align:right; font-weight:bold;">₹${item.totalPrice.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="total-box">
          <div style="font-size: 14px; color: #718096; margin-bottom: 5px;">Total Amount</div>
          <div class="grand-total">₹${quote.totalAmount.toLocaleString()}</div>
        </div>

        <div class="footer">
          This is a computer generated quotation. Thank you for your business.
        </div>
      </body>
      </html>
    `;
  };

  // --- Handlers ---

  const handleAddToQuote = () => {
    if (!width || !height || !quantity) return;

    const w = Number(width);
    const h = Number(height);
    
    // Calculate SqFt: (mm * mm) / 92903.04 roughly
    const sqMm = w * h;
    const sqFtRaw = sqMm / 92903.04;
    const sqFt = Math.max(sqFtRaw, 0); // Ensure positive
    const formattedSqFt = Number(sqFt.toFixed(2));
    
    const totalPrice = Number((formattedSqFt * price * quantity).toFixed(2));

    const newItem: QuoteItem = {
      id: uuidv4(),
      itemNumber: items.length + 1,
      type: currentType,
      brand: currentBrand,
      width: w,
      height: h,
      pricePerSqFt: price,
      quantity: quantity,
      sqFt: formattedSqFt,
      totalPrice: totalPrice,
      description: `${currentBrand} - ${currentType}`
    };

    setItems([...items, newItem]);

    // Auto clear fields
    setWidth('');
    setHeight('');
    setQuantity(1);
  };

  const handleDeleteItem = (id: string) => {
    const newItems = items.filter(i => i.id !== id).map((item, index) => ({
      ...item,
      itemNumber: index + 1
    }));
    setItems(newItems);
  };

  const handleSaveQuote = () => {
    if (items.length === 0 || !clientName) {
      alert("Please add items and Client Name to save.");
      return;
    }

    const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

    const quoteToSave: Quote = {
      id: editingQuoteId || uuidv4(),
      clientName,
      clientPhone,
      date: new Date().toLocaleDateString(),
      items,
      totalAmount,
      status: 'Draft'
    };

    saveQuote(quoteToSave);
    setSavedQuotes(getSavedQuotes());
    setEditingQuoteId(null);
    alert("Quote Saved Successfully!");
  };

  const handleLoadQuote = (quote: Quote) => {
    setItems(quote.items);
    setClientName(quote.clientName);
    setClientPhone(quote.clientPhone);
    setEditingQuoteId(quote.id);
    setView('calculator');
  };

  // Load quote and auto-print (Save as PDF with visuals)
  const handlePrintQuote = (quote: Quote) => {
    setItems(quote.items);
    setClientName(quote.clientName);
    setClientPhone(quote.clientPhone);
    setEditingQuoteId(quote.id);
    setView('calculator');
    setTimeout(() => window.print(), 100);
  };

  const handleDownloadJSON = (quote: Quote) => {
    const jsonString = JSON.stringify(quote, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    const safeName = quote.clientName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `renolx_data_${safeName}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadHTML = (quote: Quote) => {
    const htmlContent = generateQuoteHTML(quote);
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    const safeName = quote.clientName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `renolx_quote_${safeName}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = (quote: Quote) => {
    const doc = generatePDF(quote);
    const safeName = quote.clientName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    doc.save(`renolx_quote_${safeName}.pdf`);
  };

  const handleShareQuote = async (quote: Quote) => {
    const safeName = quote.clientName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    // Generate PDF Blob
    const doc = generatePDF(quote);
    const pdfBlob = doc.output('blob');
    const pdfFile = new File([pdfBlob], `quote_${safeName}.pdf`, { type: 'application/pdf' });

    if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
      try {
        await navigator.share({
          files: [pdfFile],
          title: `Renolx Quote - ${quote.clientName}`,
          text: `Please find attached the quotation for ${quote.clientName}.`
        });
        return;
      } catch (error) {
        console.log("File sharing failed, falling back to text/HTML", error);
      }
    }

    // Fallback: Try HTML
    const htmlContent = generateQuoteHTML(quote);
    const htmlFile = new File([htmlContent], `quote_${safeName}.html`, { type: 'text/html' });

    if (navigator.canShare && navigator.canShare({ files: [htmlFile] })) {
       try {
        await navigator.share({
          files: [htmlFile],
          title: `Renolx Quote - ${quote.clientName}`,
          text: `Please find attached the quotation for ${quote.clientName}.`
        });
        return;
       } catch (e) {
         console.log("HTML Share failed", e);
       }
    }

    // Fallback to text
    const text = `Renolx Quote for ${quote.clientName}\nTotal: ₹${quote.totalAmount.toLocaleString()}\nDate: ${quote.date}`;
    if (navigator.share) {
       navigator.share({
         title: 'Renolx Quote',
         text: text,
         url: window.location.href 
       }).catch(console.error);
    } else {
       navigator.clipboard.writeText(text);
       alert("Quote summary copied to clipboard! (Sharing not supported on this device)");
    }
  };

  const handleNewQuote = () => {
    setItems([]);
    setClientName('');
    setClientPhone('');
    setClientEmail('');
    setEditingQuoteId(null);
    setView('calculator');
  };

  const handleDeleteSavedQuote = (id: string) => {
    if(window.confirm("Are you sure you want to delete this quote?")) {
        deleteQuote(id);
        setSavedQuotes(getSavedQuotes());
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // --- Render ---

  return (
    <div className="min-h-screen flex flex-col">
      {/* --- Top Navigation --- */}
      <header className="bg-slate-900 text-white p-4 shadow-md no-print sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl">R</div>
             <div>
                 <h1 className="text-xl font-bold tracking-wide">RENOLX INDIA</h1>
                 <p className="text-xs text-slate-400">Professional UPVC Calculator</p>
             </div>
          </div>
          
          <nav className="flex gap-2">
            <button 
              onClick={() => setView('calculator')}
              className={`px-4 py-2 rounded-md flex items-center gap-2 transition ${view === 'calculator' ? 'bg-blue-600' : 'bg-slate-800 hover:bg-slate-700'}`}
            >
              <Calculator size={18} /> Calculator
            </button>
            <button 
              onClick={() => setView('history')}
              className={`px-4 py-2 rounded-md flex items-center gap-2 transition ${view === 'history' ? 'bg-blue-600' : 'bg-slate-800 hover:bg-slate-700'}`}
            >
              <History size={18} /> Saved Quotes
            </button>
          </nav>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full no-print">
        
        {view === 'history' ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Saved Quotations</h2>
                <button onClick={handleNewQuote} className="text-blue-600 font-medium hover:underline flex items-center gap-1">
                    <PlusCircle size={16}/> Create New
                </button>
             </div>
             
             {savedQuotes.length === 0 ? (
                 <div className="text-center py-12 text-slate-500">No saved quotes found.</div>
             ) : (
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                     {savedQuotes.map(quote => (
                         <div key={quote.id} className="border border-slate-200 rounded-lg p-5 hover:shadow-md transition bg-slate-50 relative group flex flex-col justify-between min-h-[240px]">
                             <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                 <button onClick={() => handleDeleteSavedQuote(quote.id)} className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200" title="Delete">
                                     <Trash2 size={16} />
                                 </button>
                             </div>
                             
                             <div>
                                <h3 className="font-bold text-lg text-slate-900">{quote.clientName}</h3>
                                <p className="text-sm text-slate-500 mb-2">{quote.date}</p>
                                <p className="text-sm text-slate-600">Items: {quote.items.length}</p>
                             </div>

                             <div className="mt-4 pt-4 border-t border-slate-100">
                                 <div className="font-mono font-bold text-xl text-slate-800 mb-3">₹{quote.totalAmount.toLocaleString()}</div>
                                 
                                 <div className="flex flex-wrap gap-2">
                                     <button 
                                        onClick={() => handleLoadQuote(quote)}
                                        className="flex-1 py-2 bg-slate-100 text-slate-700 rounded text-xs font-bold hover:bg-slate-200 flex justify-center items-center gap-1"
                                        title="Edit Quote"
                                     >
                                         EDIT
                                     </button>
                                     <button 
                                        onClick={() => handleDownloadPDF(quote)}
                                        className="flex-1 py-2 bg-blue-50 text-blue-700 rounded text-xs font-bold hover:bg-blue-100 flex justify-center items-center gap-1"
                                        title="Download PDF File"
                                     >
                                         <FileDown size={14} /> PDF
                                     </button>
                                     <button 
                                        onClick={() => handleDownloadHTML(quote)}
                                        className="flex-1 py-2 bg-purple-50 text-purple-700 rounded text-xs font-bold hover:bg-purple-100 flex justify-center items-center gap-1"
                                        title="Download Viewable HTML"
                                     >
                                         <FileType size={14} /> HTML
                                     </button>
                                     <button 
                                        onClick={() => handleDownloadJSON(quote)}
                                        className="flex-1 py-2 bg-emerald-50 text-emerald-700 rounded text-xs font-bold hover:bg-emerald-100 flex justify-center items-center gap-1"
                                        title="Download Data"
                                     >
                                         <FileJson size={14} /> DATA
                                     </button>
                                     <button 
                                        onClick={() => handleShareQuote(quote)}
                                        className="w-full py-2 bg-slate-800 text-white rounded text-xs font-bold hover:bg-slate-700 flex justify-center items-center gap-1 mt-1"
                                        title="Share PDF"
                                     >
                                         <Share2 size={14} /> SHARE PDF
                                     </button>
                                 </div>
                             </div>
                         </div>
                     ))}
                 </div>
             )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            
            {/* Left Panel: Inputs */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Client Details Card */}
              <section className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Client Information</h3>
                <div className="space-y-3">
                    <input 
                        type="text" 
                        placeholder="Client Name" 
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                     <input 
                        type="tel" 
                        placeholder="Phone Number" 
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                </div>
              </section>

              {/* Input Form Card */}
              <section className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Add Profile</h3>
                
                <div className="space-y-4">
                    {/* Brand and Type Selection - Combined Area */}
                    <div className="space-y-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                        {/* Brand Selection */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Select Brand</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['RENOLX', 'FENERO'].map((b) => (
                                    <button
                                        key={b}
                                        onClick={() => setCurrentBrand(b as Brand)}
                                        className={`py-2 px-3 rounded text-sm font-bold transition flex items-center justify-center gap-2 ${currentBrand === b ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'}`}
                                    >
                                        <span className={`w-2 h-2 rounded-full ${currentBrand === b ? 'bg-blue-400' : 'bg-slate-300'}`}></span>
                                        {b}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Profile Type */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Profile Type</label>
                            <select 
                                value={currentType} 
                                onChange={(e) => setCurrentType(e.target.value as ProfileType)}
                                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium text-slate-700"
                            >
                                {Object.values(ProfileType).map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Dimensions */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Width (mm)</label>
                            <input 
                                type="number" 
                                value={width} 
                                onChange={(e) => setWidth(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Height (mm)</label>
                            <input 
                                type="number" 
                                value={height} 
                                onChange={(e) => setHeight(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="grid grid-cols-2 gap-3">
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Rate (₹/Sq.Ft)</label>
                            <input 
                                type="number" 
                                value={price} 
                                onChange={(e) => setPrice(Number(e.target.value))}
                                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                             <div className="flex items-center">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 bg-slate-100 rounded-l hover:bg-slate-200 border border-r-0 border-slate-300">-</button>
                                <input 
                                    type="number" 
                                    value={quantity} 
                                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                                    className="w-full p-2 border-y border-slate-300 text-center focus:outline-none"
                                />
                                <button onClick={() => setQuantity(quantity + 1)} className="p-2 bg-slate-100 rounded-r hover:bg-slate-200 border border-l-0 border-slate-300">+</button>
                             </div>
                        </div>
                    </div>

                    {/* Add Button */}
                    <button 
                        onClick={handleAddToQuote}
                        className="w-full py-3 mt-2 bg-blue-600 text-white rounded-lg font-bold shadow hover:bg-blue-700 active:transform active:scale-95 transition flex justify-center items-center gap-2"
                    >
                        <PlusCircle size={20} /> Add to Quote
                    </button>
                </div>
              </section>

               {/* Live Preview Card (Mobile only) */}
                <div className="lg:hidden bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center">
                   <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 self-start">Preview</h3>
                   <Schematic type={currentType} width={Number(width) || 1000} height={Number(height) || 1000} className="w-full max-w-[200px]" />
                </div>

            </div>

            {/* Middle/Right: List & Visuals */}
            <div className="lg:col-span-2 flex flex-col gap-6">
                
                {/* Visualizer Panel (Desktop) */}
                <div className="hidden lg:flex bg-slate-900 rounded-xl p-8 items-center justify-center relative overflow-hidden min-h-[300px]">
                    <div className="absolute top-4 left-4 text-slate-400 font-mono text-sm">
                        LIVE PREVIEW: <span className="text-white font-bold">{currentBrand}</span>
                    </div>
                    {/* Measurement Lines Overlay (CSS-based visual aid) */}
                    <div className="absolute inset-0 pointer-events-none opacity-10" 
                        style={{backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
                    </div>
                    
                    <Schematic 
                        type={currentType} 
                        width={Number(width) || 1000} 
                        height={Number(height) || 1000} 
                        className="w-full h-full max-h-[250px] drop-shadow-2xl z-10" 
                    />
                </div>

                {/* Quote Items List */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-grow flex flex-col">
                    <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
                        <h2 className="font-bold text-lg text-slate-800">Quotation Items</h2>
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                            Total: ₹{items.reduce((a,b) => a + b.totalPrice, 0).toLocaleString()}
                        </span>
                    </div>
                    
                    <div className="p-0 overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold">
                                <tr>
                                    <th className="p-4">#</th>
                                    <th className="p-4">Brand / Type</th>
                                    <th className="p-4">Dimensions</th>
                                    <th className="p-4 text-center">Sq.Ft</th>
                                    <th className="p-4 text-right">Price</th>
                                    <th className="p-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {items.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-slate-400 italic">
                                            No items added yet. Use the form to add windows or doors.
                                        </td>
                                    </tr>
                                ) : items.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition">
                                        <td className="p-4 font-mono text-slate-400">{item.itemNumber}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${item.brand === 'RENOLX' ? 'bg-blue-600' : 'bg-slate-600'}`}>
                                                    {item.brand}
                                                </span>
                                            </div>
                                            <div className="text-slate-800 font-medium mt-1">{item.type}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-slate-700 font-medium">{item.width} x {item.height} mm</div>
                                            <div className="text-xs text-slate-400">Qty: {item.quantity}</div>
                                        </td>
                                        <td className="p-4 text-center font-mono text-slate-600">{item.sqFt}</td>
                                        <td className="p-4 text-right font-bold text-slate-800">₹{item.totalPrice.toLocaleString()}</td>
                                        <td className="p-4 text-center">
                                            <button 
                                                onClick={() => handleDeleteItem(item.id)}
                                                className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded transition"
                                                title="Remove Item"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-5 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-between items-center flex-wrap gap-3">
                        <div className="flex gap-2">
                             <button 
                                onClick={handleNewQuote}
                                className="px-4 py-2 text-slate-600 hover:bg-white border border-transparent hover:border-slate-300 rounded transition font-medium text-sm"
                            >
                                Clear All
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={handleSaveQuote}
                                className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded shadow hover:bg-emerald-700 transition font-bold text-sm"
                            >
                                <Save size={16} /> Save
                            </button>
                            <button 
                                onClick={handlePrint}
                                className="flex items-center gap-2 px-5 py-2 bg-slate-800 text-white rounded shadow hover:bg-slate-900 transition font-bold text-sm"
                            >
                                <Printer size={16} /> Print / PDF
                            </button>
                             <button 
                                onClick={() => handleShareQuote({id: 'temp', clientName: clientName || 'Draft', items, totalAmount: items.reduce((a,b)=>a+b.totalPrice,0), date: new Date().toLocaleDateString(), clientPhone: '', status: 'Draft'})}
                                className="flex items-center gap-2 px-3 py-2 bg-white text-slate-600 border border-slate-300 rounded shadow-sm hover:bg-slate-50 transition font-bold text-sm"
                            >
                                <Share2 size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

          </div>
        )}
      </main>

      {/* --- Print Layout (Hidden unless printing) --- */}
      <div className="print-only p-8 max-w-[210mm] mx-auto bg-white text-black">
         {/* Print Header */}
         <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-8">
             <div className="flex items-center gap-4">
                 <div className="w-16 h-16 bg-slate-900 text-white flex items-center justify-center text-3xl font-bold rounded">R</div>
                 <div>
                     <h1 className="text-3xl font-bold text-slate-900">RENOLX INDIA</h1>
                     <p className="text-sm text-slate-600 mt-1 uppercase tracking-widest">Premium UPVC Solutions</p>
                 </div>
             </div>
             <div className="text-right text-sm text-slate-600">
                 <p className="font-bold text-slate-900">HEAD OFFICE</p>
                 <p className="w-48 ml-auto">{COMPANY_ADDRESS}</p>
                 <p className="mt-2">Tel: +91 XXXXX XXXXX</p>
                 <p>Email: info@renolx.in</p>
             </div>
         </div>

         {/* Quote Info */}
         <div className="flex justify-between mb-8 bg-slate-50 p-4 border border-slate-200 rounded">
             <div>
                 <p className="text-xs text-slate-500 uppercase font-bold">Quotation For</p>
                 <p className="text-xl font-bold text-slate-900">{clientName || "Valued Customer"}</p>
                 <p className="text-sm text-slate-600">{clientPhone}</p>
             </div>
             <div className="text-right">
                 <p className="text-xs text-slate-500 uppercase font-bold">Quotation Details</p>
                 <p className="text-sm text-slate-800"><span className="font-bold">Date:</span> {new Date().toLocaleDateString()}</p>
                 <p className="text-sm text-slate-800"><span className="font-bold">Quote ID:</span> {editingQuoteId ? editingQuoteId.slice(0,8) : "DRAFT"}</p>
             </div>
         </div>

         {/* Items Grid for Schematic View */}
         <div className="mb-8">
             <h3 className="text-lg font-bold border-b border-slate-300 mb-4 pb-2">Technical Specifications</h3>
             <div className="grid grid-cols-2 gap-6">
                 {items.map((item) => (
                     <div key={item.id} className="break-inside-avoid border border-slate-200 rounded p-4 flex gap-4">
                         <div className="w-1/3">
                             <Schematic type={item.type} width={item.width} height={item.height} className="w-full h-auto" />
                         </div>
                         <div className="w-2/3 flex flex-col justify-center">
                             <div className="flex justify-between">
                                 <span className="font-bold text-sm bg-slate-900 text-white px-2 py-0.5 rounded text-xs">Item #{item.itemNumber}</span>
                                 <span className={`font-bold px-2 py-0.5 rounded text-xs text-white ${item.brand === 'RENOLX' ? 'bg-blue-600' : 'bg-slate-600'}`}>{item.brand}</span>
                             </div>
                             <p className="font-bold text-lg mt-1">{item.type}</p>
                             <div className="text-sm text-slate-600 mt-2 space-y-1">
                                 <p>Dimensions: <span className="font-mono text-black">{item.width}mm x {item.height}mm</span></p>
                                 <p>Quantity: {item.quantity}</p>
                                 <p>Area: {item.sqFt} Sq.Ft</p>
                             </div>
                         </div>
                     </div>
                 ))}
             </div>
         </div>

         {/* Cost Table */}
         <div className="mb-8">
            <h3 className="text-lg font-bold border-b border-slate-300 mb-4 pb-2">Cost Summary</h3>
            <table className="w-full text-left text-sm border-collapse">
                <thead>
                    <tr className="bg-slate-100 border-b border-slate-300">
                        <th className="py-2 px-2 border-x border-slate-200">#</th>
                        <th className="py-2 px-2 border-x border-slate-200">Description</th>
                        <th className="py-2 px-2 border-x border-slate-200 text-center">Qty</th>
                        <th className="py-2 px-2 border-x border-slate-200 text-right">Unit Price (sq.ft)</th>
                        <th className="py-2 px-2 border-x border-slate-200 text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map(item => (
                        <tr key={item.id} className="border-b border-slate-200">
                            <td className="py-2 px-2 border-x border-slate-200">{item.itemNumber}</td>
                            <td className="py-2 px-2 border-x border-slate-200">
                                <span className="font-bold">{item.brand}</span> - {item.type}
                                <br/><span className="text-xs text-slate-500">Dim: {item.width}x{item.height}mm | Area: {item.sqFt} sq.ft</span>
                            </td>
                            <td className="py-2 px-2 border-x border-slate-200 text-center">{item.quantity}</td>
                            <td className="py-2 px-2 border-x border-slate-200 text-right">₹{item.pricePerSqFt}</td>
                            <td className="py-2 px-2 border-x border-slate-200 text-right font-bold">₹{item.totalPrice.toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="bg-slate-100 font-bold text-lg">
                         <td colSpan={4} className="py-3 px-4 text-right border-t border-slate-300">Grand Total</td>
                         <td className="py-3 px-2 text-right border-t border-slate-300 border-x border-slate-200">₹{items.reduce((a,b) => a + b.totalPrice, 0).toLocaleString()}</td>
                    </tr>
                </tfoot>
            </table>
         </div>

         {/* Footer */}
         <div className="mt-12 text-center text-xs text-slate-400 border-t pt-4">
             <p>Thank you for your business!</p>
             <p>Renolx India - {COMPANY_ADDRESS}</p>
             <p>This is a computer generated quotation.</p>
         </div>

      </div>
    </div>
  );
};

export default App;
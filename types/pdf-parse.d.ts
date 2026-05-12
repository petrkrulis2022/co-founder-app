declare module 'pdf-parse/lib/pdf-parse.js' {
  const pdfParse: (data: any, options?: any) => Promise<{ text: string; numpages: number; info: any; metadata: any }>;
  export default pdfParse;
}

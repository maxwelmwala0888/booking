export default function WhatsAppButton() {
  return (
    <a 
      href="https://wa.me/265882183488" 
      target="_blank" 
      rel="noreferrer" 
      className="fixed bottom-8 right-8 z-[100] flex items-center justify-center w-16 h-16 bg-green-500 rounded-full shadow-2xl hover:scale-110 transition-transform cursor-pointer"
    >
      <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"></span>
      <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-8 h-8 relative z-10" />
    </a>
  );
}
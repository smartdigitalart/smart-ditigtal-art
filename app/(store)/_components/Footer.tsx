import Image from "next/image";
import { Mail } from "lucide-react";

import { Separator } from "@/components/ui/separator";

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
   <svg viewBox="0 0 24 24" fill="#1877F2" {...props}>
      <path d="M22 12.06C22 6.505 17.523 2 12 2S2 6.505 2 12.06c0 5.02 3.657 9.184 8.438 9.94v-7.03H7.898v-2.91h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.775-1.63 1.57v1.88h2.773l-.443 2.91h-2.33V22c4.78-.756 8.437-4.92 8.437-9.94Z" />
   </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
   <svg viewBox="0 0 24 24" {...props}>
      <defs>
         <linearGradient id="instagram-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFDD55" />
            <stop offset="35%" stopColor="#FF543E" />
            <stop offset="65%" stopColor="#C837AB" />
            <stop offset="100%" stopColor="#5B51D8" />
         </linearGradient>
      </defs>
      <path
         fill="url(#instagram-gradient)"
         d="M12 2c-2.72 0-3.06.012-4.123.06-1.06.05-1.79.218-2.427.465a4.9 4.9 0 0 0-1.772 1.153A4.9 4.9 0 0 0 2.525 5.45c-.247.637-.416 1.366-.465 2.428C2.012 8.94 2 9.28 2 12s.012 3.06.06 4.123c.05 1.06.218 1.79.465 2.427a4.9 4.9 0 0 0 1.153 1.772 4.9 4.9 0 0 0 1.772 1.153c.637.247 1.366.416 2.428.465C8.94 21.988 9.28 22 12 22s3.06-.012 4.123-.06c1.06-.05 1.79-.218 2.427-.465a4.9 4.9 0 0 0 1.772-1.153 4.9 4.9 0 0 0 1.153-1.772c.247-.637.416-1.366.465-2.428.048-1.06.06-1.402.06-4.122s-.012-3.06-.06-4.123c-.05-1.06-.218-1.79-.465-2.427a4.9 4.9 0 0 0-1.153-1.772A4.9 4.9 0 0 0 18.55 2.525c-.637-.247-1.366-.416-2.428-.465C15.06 2.012 14.72 2 12 2Zm0 1.802c2.67 0 2.987.01 4.042.058.976.045 1.505.207 1.858.344.467.182.8.399 1.15.748.35.35.566.683.748 1.15.137.353.3.882.344 1.858.048 1.055.058 1.372.058 4.042s-.01 2.987-.058 4.042c-.045.976-.207 1.505-.344 1.858a3.1 3.1 0 0 1-.748 1.15 3.1 3.1 0 0 1-1.15.748c-.353.137-.882.3-1.858.344-1.055.048-1.372.058-4.042.058s-2.987-.01-4.042-.058c-.976-.045-1.505-.207-1.858-.344a3.1 3.1 0 0 1-1.15-.748 3.1 3.1 0 0 1-.748-1.15c-.137-.353-.3-.882-.344-1.858-.048-1.055-.058-1.372-.058-4.042s.01-2.987.058-4.042c.045-.976.207-1.505.344-1.858.182-.467.399-.8.748-1.15.35-.35.683-.566 1.15-.748.353-.137.882-.3 1.858-.344C9.013 3.812 9.33 3.802 12 3.802Zm0 3.064a5.134 5.134 0 1 0 0 10.268 5.134 5.134 0 0 0 0-10.268Zm0 8.468a3.334 3.334 0 1 1 0-6.668 3.334 3.334 0 0 1 0 6.668Zm6.538-8.671a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0Z"
      />
   </svg>
);

const MessengerIcon = (props: React.SVGProps<SVGSVGElement>) => (
   <svg viewBox="0 0 24 24" {...props}>
      <defs>
         <linearGradient id="messenger-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00B2FF" />
            <stop offset="50%" stopColor="#006AFF" />
            <stop offset="100%" stopColor="#B900FF" />
         </linearGradient>
      </defs>
      <path
         fill="url(#messenger-gradient)"
         d="M12 2C6.477 2 2 6.145 2 11.243c0 2.9 1.446 5.483 3.71 7.173V22l3.39-1.86c.905.25 1.867.386 2.9.386 5.523 0 10-4.145 10-9.243C22 6.145 17.523 2 12 2Zm.994 12.443-2.55-2.72-4.976 2.72 5.474-5.809 2.612 2.72 4.913-2.72-5.473 5.809Z"
      />
   </svg>
);

const socialLinks = [
   { name: "Facebook", href: "https://facebook.com/", Icon: FacebookIcon },
   { name: "Instagram", href: "https://instagram.com/", Icon: InstagramIcon },
   { name: "Messenger", href: "https://m.me/", Icon: MessengerIcon },
   { name: "Email", href: "mailto:hello@smartdigitalart.com", Icon: Mail },
];

const Footer = () => {
   return (
      <footer className="mt-auto bg-black text-white">
         <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-6 px-4 py-10 sm:px-6 lg:px-8">
            <div className="rounded-xl bg-white p-2">
               <Image
                  src="/SMART_DIGITAL_ART_PAD_LOGO.jpg.jpeg"
                  alt="Smart Digital Art"
                  width={200}
                  height={200}
                  className="h-14 w-auto"
               />
            </div>

            <div className="flex items-center gap-3">
               {socialLinks.map(({ name, href, Icon }) => (
                  <a
                     key={name}
                     href={href}
                     target="_blank"
                     rel="noopener noreferrer"
                     aria-label={name}
                     className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm transition-transform hover:scale-110"
                  >
                     <Icon
                        className={`h-[18px] w-[18px] ${name === "Email" ? "text-[#EA4335]" : ""}`}
                     />
                  </a>
               ))}
            </div>

            <Separator className="bg-white/20" />
            <p className="text-center text-xs leading-relaxed text-gray-400">
               © {new Date().getFullYear()} Smart Digital Art. All rights reserved.
            </p>
         </div>
      </footer>
   );
};

export default Footer;

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/animate-ui/components/tooltip";
import { mediaSocial } from "@/data/socialMedia";
import { FaRegCopyright } from "react-icons/fa6";

const Footer = () => {
  const currentDate = new Date().getFullYear();

  return (
    <footer className="text-white h-52">
      <div className="container mx-auto px-4 h-full items-center flex justify-center relative">
        <ul className="flex flex-row gap-8">
          {mediaSocial.map((item, index) => (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <li key={index}>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <item.icon className="size-8 text-zinc-700 hover:text-white duration-200" />
                    </a>
                  </li>
                </TooltipTrigger>
                <TooltipContent>{item.text}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </ul>
        <small className="flex flex-row items-center gap-3 text-center bottom-0 absolute text-zinc-700">
          <FaRegCopyright /> {currentDate} AiVision. All rights reserved.
        </small>
      </div>
    </footer>
  );
};

export default Footer;

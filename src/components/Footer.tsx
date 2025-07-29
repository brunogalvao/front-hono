import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/animate-ui/components/tooltip';
import { mediaSocial } from '@/data/socialMedia';
import { FaRegCopyright } from 'react-icons/fa6';

const Footer = () => {
  const currentDate = new Date().getFullYear();

  return (
    <footer className="h-52 text-white">
      <div className="relative container mx-auto flex h-full items-center justify-center px-4">
        <ul className="flex flex-row gap-12">
          {mediaSocial.map((item, index) => (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger>
                  <li>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <item.icon className="size-8 text-zinc-700 duration-200 hover:text-white" />
                    </a>
                  </li>
                </TooltipTrigger>
                <TooltipContent>{item.text}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </ul>
        <small className="absolute bottom-0 flex flex-row items-center gap-3 text-center text-zinc-700">
          <FaRegCopyright /> {currentDate} AiVision. All rights reserved.
        </small>
      </div>
    </footer>
  );
};

export default Footer;

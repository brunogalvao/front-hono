const Footer = () => {
  const currentDate = new Date().getFullYear();

  return (
    <footer className="text-white h-52">
      <div className="container mx-auto px-4 h-full items-center flex justify-center relative">
        <small className="text-center bottom-0 absolute text-zinc-700">
          © {currentDate} AiVision. All rights reserved.
        </small>
      </div>
    </footer>
  );
};

export default Footer;

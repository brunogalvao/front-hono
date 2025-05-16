import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen ">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2">
          <h1 className="text-4xl font-bold mb-6 text-primary">Bem-vindo!</h1>
          <div className="flex justify-end">
            <Button variant="link">
              <Link
                to="/login"
                className="text-white font-semibold py-2 px-4 rounded transition duration-300"
              >
                Login
              </Link>
            </Button>
          </div>
        </div>
        <p className="text-gray-600">
          Esta é a página inicial do nosso sistema. Por favor, faça login para
          acessar o CRUD.
        </p>
      </div>
    </div>
  );
}

export default Home;

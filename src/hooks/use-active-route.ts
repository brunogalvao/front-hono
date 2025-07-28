import { useRouter } from '@tanstack/react-router'

export function useActiveRoute() {
  const router = useRouter()
  const currentPath = router.state.location.pathname

  const isActive = (path: string) => {
    // Verifica se a rota atual corresponde exatamente ao path
    if (currentPath === path) return true
    
    // Para rotas aninhadas, verifica se o path atual começa com o path fornecido
    // Mas apenas se não for a rota raiz
    if (path !== '/' && currentPath.startsWith(path)) return true
    
    return false
  }

  return {
    currentPath,
    isActive,
  }
} 
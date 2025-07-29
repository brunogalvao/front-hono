// getExpenseTypesFromTasks.ts
import { supabase } from '@/lib/supabase';

export const getExpenseTypes = async (): Promise<{ name: string }[]> => {
  const session = await supabase.auth.getSession();
  const user_id = session.data.session?.user?.id;

  if (!user_id) throw new Error('Usuário não autenticado.');

  const { data, error } = await supabase
    .from('tasks')
    .select('type')
    .eq('user_id', user_id)
    .not('type', 'is', null);

  if (error) throw error;

  // Extrair valores únicos e remover duplicatas
  const uniqueTypes = Array.from(
    new Set(data.map((t) => t.type?.trim()).filter(Boolean))
  );

  return uniqueTypes.map((name) => ({ name }));
};

// getExpenseTypesFromTasks.ts
import { supabase } from '@/lib/supabase';

export const getExpenseTypes = async (): Promise<{ name: string }[]> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error('Usuário não autenticado.');
  const user_id = userData.user.id;

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

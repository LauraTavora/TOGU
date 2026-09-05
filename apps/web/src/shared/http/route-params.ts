/**
 * No Next.js 15, `params` em rotas dinâmicas é assíncrono — ver
 * https://nextjs.org/docs/app/building-your-application/upgrading/version-15.
 */
export interface RouteParams<T extends Record<string, string>> {
  params: Promise<T>;
}

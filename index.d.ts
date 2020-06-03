declare module "@rplan/express-schema-validation-middleware" {
  import Express = require('express')

  interface ParamsDictionary { [key: string]: string; }
  type ParamsArray = string[];
  type Params = ParamsDictionary | ParamsArray;

  export interface OpenApiValidatorFactoryResult<P extends Params = ParamsDictionary, ResBody = any, ReqBody = any> {
    getBodyValidationMiddleware: (path: string[]) => Express.RequestHandler<P, ReqBody, ResBody>,
    getParamsValidationMiddleware: (path: string[]) => Express.RequestHandler<P, ReqBody, ResBody>,
    getQueryValidationMiddleware: (path: string[]) => Express.RequestHandler<P, ReqBody, ResBody>,
    getHeaderValidationMiddleware: (path: string[]) => Express.RequestHandler<P, ReqBody, ResBody>,
    getResponseValidationEndPoint: (path: string[]) => {
      validator: (httpCode: string) => {
        validate: (res: Express.Response) => boolean,
        errors: object[],
      },
    },
  }

  export function OpenApiValidator<P extends Params = ParamsDictionary, ResBody = any, ReqBody = any>(
    filePath: string,
    options?: { [key: string]: any },
  ): OpenApiValidatorFactoryResult<P, ReqBody, ResBody>
}

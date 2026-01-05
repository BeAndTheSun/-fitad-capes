type CommonCode = 'not_found';

// eslint-disable-next-line @typescript-eslint/ban-types
export type HandlerError<Code extends string = CommonCode | (string & {})> = {
  code: Code;
  message?: string;
  errors?: HandlerError<Code>[];
};

export type HandlerResult<
  Data,
  // eslint-disable-next-line @typescript-eslint/ban-types
  Code extends string = CommonCode | (string & {}),
  Error extends HandlerError = HandlerError<Code>,
> =
  | {
      success: true;
      data: Data;
    }
  | {
      success: false;
      error: Error;
    };

type HttpCommonCode = 'response_error' | 'request_error';

export type HttpHandlerError<
  // eslint-disable-next-line @typescript-eslint/ban-types
  Code extends string = HttpCommonCode | (string & {}),
> = HandlerError<Code> & { statusCode?: number; response?: unknown };

export type HttpHandlerResult<
  Response,
  // eslint-disable-next-line @typescript-eslint/ban-types
  Code extends string = HttpCommonCode | (string & {}),
  Error extends HttpHandlerError = HttpHandlerError<Code>,
> = HandlerResult<Response, Code, Error>;

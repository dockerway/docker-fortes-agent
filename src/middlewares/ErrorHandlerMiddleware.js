import http from "http";

const validateStatusCode = (statusCode) => http.STATUS_CODES.hasOwnProperty(statusCode)

export function ErrorHandlerMiddleware(err, _req, res, _next) {
    const status = (err.status && validateStatusCode(err.status)) ? err.status : 500

    res.status(status)
    res.send(err.message)
}





import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosPromise,
  AxiosResponse,
  AxiosError
} from 'axios'
import Observable from 'zen-observable'
import { RemoteData } from './remoteData'

type HTTP_METHOD = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
const MUTATION_METHOD = ['POST', 'PATCH', 'PUT']

export const HTTP = <T>(options: AxiosRequestConfig = {}) => {
  const client: AxiosInstance = axios.create(options)
  const defaultRemoteData: RemoteData<T, Error> = {
    status: {
      pending: false,
      success: false,
      notFound: false,
      hasError: false
    },
    data: {} as T,
    error: undefined
  }

  const processResponse = (
    remoteData: RemoteData<T, Error>,
    response: AxiosResponse<T>
  ): RemoteData<T, Error> => {
    return {
      ...remoteData,
      status: {
        ...remoteData.status,
        pending: false,
        success: true,
        notFound: false,
        hasError: false
      },
      data: response.data
    }
  }

  const processError = (
    remoteData: RemoteData<T, Error>,
    error: AxiosError<T>
  ): RemoteData<T, Error> => {
    const statusCode: number = error?.response?.status as number
    return {
      ...remoteData,
      status: {
        ...remoteData.status,
        pending: false,
        success: false,
        notFound: statusCode === 404,
        hasError: true,
        code: statusCode
      },
      error: error.toJSON() as Error
    }
  }

  const toObservableRequest = (
    httpMethod: HTTP_METHOD,
    url: string,
    queryParams?: object,
    body?: object
  ) => {
    const isMutation = MUTATION_METHOD.includes(httpMethod)
    const method = client[
      httpMethod.toLowerCase() as keyof AxiosInstance
    ] as Function
    const args = isMutation
      ? [url, body, { params: queryParams }]
      : [url, { params: queryParams }]
    const request: AxiosPromise<T> = method(...args)

    return new Observable<RemoteData<T, Error>>(subscriber => {
      const remoteData = { ...defaultRemoteData }
      remoteData.status.pending = true
      subscriber.next(defaultRemoteData)
      request
        .then(response => {
          subscriber.next(processResponse(remoteData, response))
          subscriber.complete()
        })
        .catch((err: Error) => {
          subscriber.next(processError(remoteData, err as AxiosError<T>))
          subscriber.complete()
        })
    })
  }

  return {
    get: (url: string, queryParams?: object) =>
      toObservableRequest('GET', url, queryParams),

    post: (url: string, body: object, queryParams?: object) =>
      toObservableRequest('POST', url, queryParams, body),

    put: (url: string, body: object, queryParams?: object) =>
      toObservableRequest('PUT', url, queryParams, body),

    patch: (url: string, body: object, queryParams?: object) =>
      toObservableRequest('PATCH', url, queryParams, body),

    delete: (url: string, queryParams?: object) =>
      toObservableRequest('DELETE', url, queryParams)
  }
}

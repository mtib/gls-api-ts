import axios from 'axios';
import { isObjectLike, isString } from 'lodash';

export const ERROR_NO_RESULTS = 'E000';
export const ERROR_NO_RESULTS_DESCRIPTION = 'Unfortunately there are no results.<br>Please check your entry.<br>It is also possible, that your parcel has not reached us yet. Please try again later.';

export const ERROR_TYPES = [
    ERROR_NO_RESULTS,
] as const;

export const ERROR_DESCRIPTIONS = [
    ERROR_NO_RESULTS_DESCRIPTION,
] as const;

export const ERROR_DESCRIPTION_MAP: Record<typeof ERROR_TYPES[number], string> = {
    [ERROR_NO_RESULTS]: ERROR_NO_RESULTS_DESCRIPTION,
};

export type GLSExceptionCode = typeof ERROR_TYPES[number];
export type GLSExceptionDescription = typeof ERROR_DESCRIPTIONS[number];

export type GLSError = {
    exceptionText: GLSExceptionDescription,
    lastError: GLSExceptionCode,
}

export type GLSResult<RefNumber extends string> = {
    tuStatus: {
        tuNo: RefNumber,
        references: { type: string, name: string, value: string }[],
        owners: { type: string, code: string }[],
        infos: { type: string, name: string, value: string }[],
        history: { date: string, time: string, address: { city: string, countryName: string, countryCode: string }, evtDscr: string }[],
        signature: { validate: boolean, name: string, value: string },
        progressBar: { level: number, statusText: string, statusInfo: string, evtNos: string[], statusBar: { status: string, statusText: string, imageStatus: string, imageText: string }[], retourFlag: boolean, colourIndex: number },
        changeDeliveryPossible: boolean,
        arrivalTime: { name: string, value: string },
        deliveryOwnerCode: string,
    }[],
};

export const isGLSError = (obj: unknown): obj is GLSError => isObjectLike(obj) && isString(obj['lastError']);

export const getOrderStatus = <T extends string>(tracking: T): Promise<GLSResult<T> | GLSError> => axios
    .get<GLSResult<T> | GLSError>(
        'https://gls-group.eu/app/service/open/rest/GROUP/en/rstt001',
        {
            params: {
                match: tracking,
                type: '',
                caller: 'witt002',
                millis: new Date().getTime(),
            },
            headers: {
                "accept": "application/json",
            },
            validateStatus: () => true,
        },
    ).then(({ data }) => data);

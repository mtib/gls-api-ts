import { ERROR_NO_RESULTS, getOrderStatus, isGLSError } from "./gls";
import * as colors from 'colors/safe';
import * as table from 'text-table';
import { clone, isArray, isObject, isString, isUndefined } from "lodash";

export { }

const codes = process.argv.slice(2);

if (codes.length === 0) {
    console.log('No GLS tracking number provided');
    process.exit(1);
}

const printInfo = (code: string, info: { status?: string, weight?: string, changed?: string }) => {
    return [colors.bold(colors.blue(code)), colors.bold(colors.red(info.status || 'NONE')), info.weight || '-', info.changed || 'never'];
}

Promise.all(codes.map((code) => getOrderStatus(code)
    .then((data) => {
        if (isGLSError(data)) {
            if (data.lastError === ERROR_NO_RESULTS) {
                return printInfo(code, { status: 'NO RESULTS' });
            }
        } else {
            const status = data.tuStatus.find(status => status.progressBar?.statusInfo).progressBar?.statusInfo;
            const weight = data.tuStatus.map(status => status.infos?.find((info) => info.type === 'WEIGHT').value).find(isString);
            const lastChange = data.tuStatus.map(status => status.history?.[0]).find(isObject);
            if (status) {
                return printInfo(code, { status, weight, ...(lastChange && { changed: `${lastChange.time} ${lastChange.date}` }) });
            }
        }
        console.log(code);
        console.dir(data);
        return undefined;
    })))
    .then((results) => {
        console.log(table(
            [
                ['tracking no', 'state', 'weight', 'changed'].map(header => colors.bold(header.toUpperCase())),
                ...results.filter(isArray),
            ],
            {
                stringLength: (s) => colors.strip(s).length,
            }
        ));
    });


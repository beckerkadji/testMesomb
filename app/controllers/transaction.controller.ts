import {Body, Post, Route, Tags} from "tsoa";
import {  IResponse, My_Controller } from "./controller";
import { ResponseHandler } from "../../src/config/responseHandler";
import code from "../../src/config/code";
import axios from "axios";
import { Signature } from "../utils/signature";
import Settings from "../utils/settings";
const response = new ResponseHandler()

interface paiementInterface {
    amount: number,
    payer: String
}

interface depositInterface {

}



@Tags("Transaction Controller")
@Route("/transaction")

export class TransactionController extends My_Controller {


    @Post('/paiement')
    public async paiement(
        @Body() body : paiementInterface 
    ): Promise<IResponse> {
        try {
            const url: string = 'https://mesomb.hachther.com/api/v1.1/payment/collect/';
            const AppKey = <string>process.env.APP_KEY
            let data : any = {
                    amount  : body.amount,
                    payer : body.payer,
                    fees: true,
                    service : 'MTN',
                    country : 'CM',
                    currency : 'XAF'
                }

            let date = new Date()

            let authorization = this._getAuthorization(
                'POST',
                'payment/collect/',
                date,
                '',
                {'content-type': 'application/json'},
                data
            )

            const headers: Record<string, string> = {
                "Autorization": authorization,
                'x-mesomb-date': String(date.getTime()),
                'x-mesomb-nonce': '',
                'Content-Type': 'application/json',
                'X-MeSomb-Application': AppKey,
            }

            const res = await this.payment(data, headers, url);
            // const res = await fetch(url, 
            //     { 
            //         method: 'POST',
            //         body: JSON.stringify(data),
            //         headers
            //     })
            console.log('response', res)


            return response.liteResponse(code.SUCCESS, "Success paiement !", res )
        }catch(e){
            return response.catchHandler(e)
        }

    }

    @Post('/deposit')
    public async login(
        @Body() body : depositInterface
    ) : Promise<IResponse> {
        try {
            console.log('body', body)
           
        return response.liteResponse(code.SUCCESS, "Success Deposit !", )
        }
        catch (e){
            return response.catchHandler(e)
        }
    }

    private _getAuthorization(
        method: string,
        endpoint: string,
        date: Date,
        nonce: string,
        headers: Record<string, string> = {},
        body: Record<string, any> | undefined = undefined,
      ): string {
        const url = this._buildUrl(endpoint);
    
        const credentials = { 
            accessKey: <string>process.env.APP_ACCESS_KEY,
            secretKey: <string>process.env.APP_SECRET_KEY
        };
        
        let signature = Signature.signRequest('payment', method, url, date, nonce, credentials, headers, body);
        return signature
      }

      private _buildUrl(endpoint: string): string {
        return `${Settings.HOST}/en/api/${Settings.APIVERSION}/${endpoint}`;
      }
}
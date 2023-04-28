import {Body, Get, Path, Post, Route, Tags} from "tsoa";
import {  IResponse, My_Controller } from "./controller";
import { ResponseHandler } from "../../src/config/responseHandler";
import code from "../../src/config/code";
import { PaymentOperation, Signature } from "@hachther/mesomb";
import TransactionType from "../types/transaction.type";
import { paymentSchema } from "../validations/transaction.validation";
const response = new ResponseHandler()

@Tags("Transaction Controller")
@Route("/transaction")

export class TransactionController extends My_Controller {


    @Post('/payment')
    public async paiement(
        @Body() body : TransactionType.payment 
    ): Promise<IResponse> {
        try {
            const validate = this.validate(paymentSchema, body)
            if(validate !== true)
                return response.liteResponse(code.VALIDATION_ERROR, "Validation Error !", validate)

            let service = this.getService(<string>body.phone)
            if( service === 'ERROR') return response.liteResponse(code.FAILURE, 'Service not recognized !')

            const payment = new PaymentOperation(
                {
                    applicationKey : <string>process.env.APP_KEY,
                    accessKey : <string>process.env.APP_ACCESS_KEY,
                    secretKey : <string>process.env.APP_SECRET_KEY
                }
            );
            
            const res: any = await payment.makeCollect(body.amount, service, <string>body.phone, new Date(), Signature.nonceGenerator(), null);
            if(res.isOperationSuccess() || res.isTransactionSuccess())
                return response.liteResponse(code.SUCCESS, "Success paiement !", res )
            
            return response.liteResponse(code.FAILURE, "Request Failed", res )
        }catch(e){
            return response.catchHandler(e)
        }

    }

    @Post('/deposit')
    public async login(
        @Body() body : TransactionType.deposit
    ) : Promise<IResponse> {
        try {
            const validate = this.validate(paymentSchema, body)
            if(validate !== true)
                return response.liteResponse(code.VALIDATION_ERROR, "Validation Error !", validate)

            let service = this.getService(<string>body.phone)
            if( service === 'ERROR') return response.liteResponse(code.FAILURE, 'Service not recognized !')

            const payment = new PaymentOperation(
                {
                    applicationKey : <string>process.env.APP_KEY,
                    accessKey : <string>process.env.APP_ACCESS_KEY,
                    secretKey : <string>process.env.APP_SECRET_KEY
                }
            );
            
            const res: any = await payment.makeDeposit(body.amount, service, <string>body.phone, new Date(), Signature.nonceGenerator(), null);
            if(res.isOperationSuccess() || res.isTransactionSuccess())
                return response.liteResponse(code.SUCCESS, "Success paiement !", res)
            
            return response.liteResponse(code.FAILURE, "Request Failed", res )
        }
        catch (e){
            return response.catchHandler(e)
        }
    }

    @Get('/application-status')
    public async getApplicaitonStatus(): Promise<IResponse> {
        try{
        const payment = new PaymentOperation(
            {
                applicationKey : <string>process.env.APP_KEY,
                accessKey : <string>process.env.APP_ACCESS_KEY,
                secretKey : <string>process.env.APP_SECRET_KEY
            }
        );

        const application = await payment.getStatus();
        if(!application)
            return response.liteResponse(code.FAILURE, 'Request Error')
        
        return response.liteResponse(code.SUCCESS, 'SUCCESS !', application)

        }catch(e){
            return response.catchHandler(e)
        }
    }

    // @Get('/transaction/{id}')
    // public async getTransaction(
    //     @Path() id: string
    // ): Promise<IResponse> {
    //     try {

    //     const payment = new PaymentOperation(
    //         {
    //             applicationKey : <string>process.env.APP_KEY,
    //             accessKey : <string>process.env.APP_ACCESS_KEY,
    //             secretKey : <string>process.env.APP_SECRET_KEY
    //         }
    //     );
    //     const transactions = await payment.getTransactions(['id1']);
    //     if(!transactions)
    //         return response.liteResponse(code.NOT_FOUND, 'TRANSACTION NOT FOUND')
        
    //     return response.liteResponse(code.SUCCESS, 'SUCCESS !', transactions)
    //     }catch(e){
    //         return response.catchHandler(e);
    //     }
    // }

    private getService (number: string): string {
            
        if(
            number.slice(0, 3) === '650' ||
            number.slice(0, 3) === '651' ||
            number.slice(0, 3) === '652' ||
            number.slice(0, 3) === '653' ||
            number.slice(0, 3) === '654' ||
            number.slice(0, 2) === '67' ||
            number.slice(0, 2) === '68'
        ){
            return 'MTN'
        } else if(
            number.slice(0, 3) === '655' ||
            number.slice(0, 3) === '656' ||
            number.slice(0, 3) === '657' ||
            number.slice(0, 3) === '658' ||
            number.slice(0, 3) === '659' ||
            number.slice(0, 2) === '69' 
        ){
            return 'ORANGE'
        } else {
            return 'ERROR'
        }
    }
    
}
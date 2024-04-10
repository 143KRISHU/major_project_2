class ApiResponse {
    constructor(statuCode, data, message = "sucsess"){
        this.statuCode = statuCode;
        this.data=data;
        this.message= message;
        this.success = statuCode<400;
    }
}
export{ApiResponse};
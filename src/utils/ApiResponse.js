class ApiResponse{
    constructor(statusCode,data,message = "successfull"){
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
    }
}

export {ApiResponse}; 
from fastapi import HTTPException, status

class EonXRPBaseException(Exception):
    """Base exception for EonXRP platform"""
    pass

class UserNotFoundException(EonXRPBaseException):
    """Raised when a user is not found"""
    pass

class InvalidCredentialsException(EonXRPBaseException):
    """Raised when authentication fails"""
    pass

class TransactionException(EonXRPBaseException):
    """Raised for transaction-related errors"""
    pass

def http_exception_handler(exc: Exception):
    """Generic HTTP exception handler"""
    if isinstance(exc, UserNotFoundException):
        return HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    elif isinstance(exc, InvalidCredentialsException):
        return HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    elif isinstance(exc, TransactionException):
        return HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Transaction failed"
        )
    else:
        return HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )

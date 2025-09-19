// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract AuthWallet {
    // state variables
    uint256 public s_operationId; // operation ID
    uint256 public constant MAX_APPROVAL_COUNT = 2; // max approval count to be authenticated

    // errors
    error NotAnAuthWallet();
    error AlreadyApproved();
    error AlreadyRejected();
    error AlreadyVoted();
    error UserNotRegistered();
    error UserAlreadyAuthenticated();
    error UserAlreadyRejected();
    error OnlyMainWalletCanReset();
    error InvalidOperationId();
    error OperationNotActive();

    // events
    event UserRegistered(uint256 indexed operationID, address indexed mainWallet, address[3] authWallets);
    event ApprovalGranted(uint256 indexed operationID, address indexed authWallet, address indexed mainWallet, uint256 approvalCount);
    event RejectionGranted(uint256 indexed operationID, address indexed authWallet, address indexed mainWallet, uint256 rejectionCount);
    event UserAuthenticated(uint256 indexed operationID, address indexed mainWallet);
    event UserRejected(uint256 indexed operationID, address indexed mainWallet);
    event AuthenticationReset(uint256 indexed operationID, address indexed mainWallet);

    // type declarations
    struct Data{
        uint256 opId;
        address mainWallet;
        address[3] authWallets;
        uint256 approvalCount;
        uint256 rejectionCount;
        bool isAuthenticated;
        bool isRejected;
    }
    
    mapping(address user => bool isAuthenticated) public userAuthentication;
    mapping(address user => Data data) public userData;
    mapping(uint256 operationId => Data data) public operationData; // track operations by ID
    mapping(uint256 operationId => mapping(address authWallet => bool)) public hasApproved; // track approvals by operation and auth wallet
    mapping(uint256 operationId => mapping(address authWallet => bool)) public hasRejected; // track rejections by operation and auth wallet
    mapping(address authWallet => uint256[] operationIds) public authWalletOperations; // New: track which operations an auth wallet is involved in


    // modifiers
    modifier _noSimilarAuthWallets(address[3] calldata authWallets){
        require(authWallets[0] != authWallets[1] && authWallets[0] != authWallets[2] && authWallets[1] != authWallets[2], "Auth wallets must be different!!!");
        _;
    }

    modifier _mainWalletCannotBeAuthWallet(address mainWallet, address[3] calldata authWallets){
        require(mainWallet != authWallets[0] && mainWallet != authWallets[1] && mainWallet != authWallets[2], "Main wallet cannot be an auth wallet!!!");
        _;
    }

    // functions
    constructor(){
        s_operationId = 0;
    }

    /**
        @notice User will call this function to authenticate themself!!!
     */
    function register(address /* mainWallet*/, address[3] calldata authWallets) public _mainWalletCannotBeAuthWallet(msg.sender, authWallets) _noSimilarAuthWallets(authWallets) {

        if(userAuthentication[msg.sender]) revert UserAlreadyAuthenticated();

        uint256 currentOpId = ++s_operationId;
        Data memory data = Data({
            opId: currentOpId,
            mainWallet: msg.sender,
            authWallets: authWallets,
            approvalCount: 0,
            rejectionCount: 0,
            isAuthenticated: false,
            isRejected: false
        });
        
        userData[msg.sender] = data;
        operationData[currentOpId] = data;

        // Track which operations each auth wallet is involved in
        for(uint256 i=0; i<3; i++){
            authWalletOperations[authWallets[i]].push(currentOpId);
        }

        emit UserRegistered(currentOpId, msg.sender, authWallets);
    }

    /**
        @notice Auth wallets call this function to approve authentication for a specific operation
        @param operationId The specific operation ID to approve
     */
    function approve(uint256 operationId) public {
        Data storage opData = operationData[operationId];
        
        // Check if operation exists
        if(opData.mainWallet == address(0)) revert InvalidOperationId();
        
        // Check if operation is still active (not already authenticated or rejected)
        if(opData.isAuthenticated) revert UserAlreadyAuthenticated();
        if(opData.isRejected) revert UserAlreadyRejected();
        
        // Check if caller is an auth wallet for this operation
        bool isAuthWallet = false;
        for(uint256 i = 0; i < 3; i++) {
            if(opData.authWallets[i] == msg.sender) {
                isAuthWallet = true;
                break;
            }
        }
        if(!isAuthWallet) revert NotAnAuthWallet();
        
        // Check if this auth wallet has already voted (approved or rejected)
        if(hasApproved[operationId][msg.sender]) revert AlreadyApproved();
        if(hasRejected[operationId][msg.sender]) revert AlreadyVoted();
        
        // Mark as approved and increment count
        hasApproved[operationId][msg.sender] = true;
        opData.approvalCount++;
        
        // Update user data as well
        userData[opData.mainWallet].approvalCount = opData.approvalCount;
        
        emit ApprovalGranted(operationId, msg.sender, opData.mainWallet, opData.approvalCount);
        
        // Check if decision can be made (either threshold reached or all voted)
        _checkAuthenticationDecision(operationId);
    }

    /**
        @notice Auth wallets call this function to reject authentication for a specific operation
        @param operationId The specific operation ID to reject
     */
    function notApprove(uint256 operationId) public {
        Data storage opData = operationData[operationId];
        
        // Check if operation exists
        if(opData.mainWallet == address(0)) revert InvalidOperationId();
        
        // Check if operation is still active (not already authenticated or rejected)
        if(opData.isAuthenticated) revert UserAlreadyAuthenticated();
        if(opData.isRejected) revert UserAlreadyRejected();
        
        // Check if caller is an auth wallet for this operation
        bool isAuthWallet = false;
        for(uint256 i = 0; i < 3; i++) {
            if(opData.authWallets[i] == msg.sender) {
                isAuthWallet = true;
                break;
            }
        }
        if(!isAuthWallet) revert NotAnAuthWallet();
        
        // Check if this auth wallet has already voted (approved or rejected)
        if(hasApproved[operationId][msg.sender]) revert AlreadyVoted();
        if(hasRejected[operationId][msg.sender]) revert AlreadyRejected();
        
        // Mark as rejected and increment count
        hasRejected[operationId][msg.sender] = true;
        opData.rejectionCount++;
        
        // Update user data as well
        userData[opData.mainWallet].rejectionCount = opData.rejectionCount;
        
        emit RejectionGranted(operationId, msg.sender, opData.mainWallet, opData.rejectionCount);
        
        // Check if decision can be made (either threshold reached or all voted)
        _checkAuthenticationDecision(operationId);
    }

    /**
        @notice Internal function to check if authentication decision can be made
        @param operationId The operation ID to check
     */
    function _checkAuthenticationDecision(uint256 operationId) internal {
        Data storage opData = operationData[operationId];
        uint256 totalVotes = opData.approvalCount + opData.rejectionCount;
        
        // If we have 2 approvals, authenticate
        if(opData.approvalCount >= MAX_APPROVAL_COUNT) {
            opData.isAuthenticated = true;
            userData[opData.mainWallet].isAuthenticated = true;
            userAuthentication[opData.mainWallet] = true;
            emit UserAuthenticated(operationId, opData.mainWallet);
        }
        // If we have 2 rejections, reject
        else if(opData.rejectionCount >= MAX_APPROVAL_COUNT) {
            opData.isRejected = true;
            userData[opData.mainWallet].isRejected = true;
            emit UserRejected(operationId, opData.mainWallet);
        }
        // If all 3 have voted and no clear majority (but could be 1-2 in either direction)
        else if(totalVotes == 3) {
            if(opData.approvalCount > opData.rejectionCount) {
                // More approvals than rejections
                opData.isAuthenticated = true;
                userData[opData.mainWallet].isAuthenticated = true;
                userAuthentication[opData.mainWallet] = true;
                emit UserAuthenticated(operationId, opData.mainWallet);
            } else {
                // More rejections than approvals
                opData.isRejected = true;
                userData[opData.mainWallet].isRejected = true;
                emit UserRejected(operationId, opData.mainWallet);
            }
        }
    }

    /**
        @notice Check if a user is authenticated
        @param user Address of the user to check
        @return bool indicating if user is authenticated
     */
    function isAuthenticated(address user) public view returns (bool) {
        return userAuthentication[user];
    }

    /**
        @notice Get user data including approval count
        @param user Address of the user
        @return Data struct containing user information
     */
    function getUserData(address user) public view returns (Data memory) {
        return userData[user];
    }

    /**
        @notice Get approval status for a specific auth wallet and operation
        @param operationId The operation ID
        @param authWallet The auth wallet address
        @return bool indicating if the auth wallet has approved
     */
    function getApprovalStatus(uint256 operationId, address authWallet) public view returns (bool) {
        return hasApproved[operationId][authWallet];
    }

    /**
        @notice Get the current approval count for a user
        @param user Address of the user
        @return uint256 current approval count
     */
    function getApprovalCount(address user) public view returns (uint256) {
        return userData[user].approvalCount;
    }

    /**
        @notice Check if authentication threshold is met for a user
        @param user Address of the user
        @return bool indicating if threshold is met
     */
    function isThresholdMet(address user) public view returns (bool) {
        return userData[user].approvalCount >= MAX_APPROVAL_COUNT;
    }

    /**
        @notice Get all operation IDs that an auth wallet is involved in
        @param authWallet Address of the auth wallet
        @return uint256[] array of operation IDs
     */
    function getAuthWalletOperations(address authWallet) public view returns (uint256[] memory) {
        return authWalletOperations[authWallet];
    }

    /**
        @notice Get pending operations for an auth wallet (not yet voted by this wallet and still active)
        @param authWallet Address of the auth wallet
        @return uint256[] array of pending operation IDs
     */
    function getPendingOperations(address authWallet) public view returns (uint256[] memory) {
        uint256[] memory allOps = authWalletOperations[authWallet];
        uint256[] memory tempPending = new uint256[](allOps.length);
        uint256 pendingCount = 0;
        
        for(uint256 i = 0; i < allOps.length; i++) {
            uint256 opId = allOps[i];
            // Check if operation is still active and not voted by this auth wallet
            if(!operationData[opId].isAuthenticated && !operationData[opId].isRejected && 
               !hasApproved[opId][authWallet] && !hasRejected[opId][authWallet]) {
                tempPending[pendingCount] = opId;
                pendingCount++;
            }
        }
        
        // Create properly sized array
        uint256[] memory pending = new uint256[](pendingCount);
        for(uint256 i = 0; i < pendingCount; i++) {
            pending[i] = tempPending[i];
        }
        
        return pending;
    }

    /**
        @notice Get operation data by operation ID
        @param operationId The operation ID
        @return Data struct containing operation information
     */
    function getOperationData(uint256 operationId) public view returns (Data memory) {
        return operationData[operationId];
    }

    /**
        @notice Check if an auth wallet has approved a specific operation
        @param operationId The operation ID
        @param authWallet The auth wallet address
        @return bool indicating approval status
     */
    function hasAuthWalletApproved(uint256 operationId, address authWallet) public view returns (bool) {
        return hasApproved[operationId][authWallet];
    }

    /**
        @notice Check if an auth wallet has rejected a specific operation
        @param operationId The operation ID
        @param authWallet The auth wallet address
        @return bool indicating rejection status
     */
    function hasAuthWalletRejected(uint256 operationId, address authWallet) public view returns (bool) {
        return hasRejected[operationId][authWallet];
    }

    /**
        @notice Get the current rejection count for a user
        @param user Address of the user
        @return uint256 current rejection count
     */
    function getRejectionCount(address user) public view returns (uint256) {
        return userData[user].rejectionCount;
    }

    /**
        @notice Check if a user's authentication was rejected
        @param user Address of the user to check
        @return bool indicating if user was rejected
     */
    function isRejected(address user) public view returns (bool) {
        return userData[user].isRejected;
    }

    /**
        @notice Get all pending operations in the system (for admin/monitoring purposes)
        @return uint256[] array of all pending operation IDs
     */
    function getAllPendingOperations() public view returns (uint256[] memory) {
        uint256[] memory tempPending = new uint256[](s_operationId);
        uint256 pendingCount = 0;
        
        for(uint256 i = 1; i <= s_operationId; i++) {
            if(!operationData[i].isAuthenticated && !operationData[i].isRejected) {
                tempPending[pendingCount] = i;
                pendingCount++;
            }
        }
        
        // Create properly sized array
        uint256[] memory pending = new uint256[](pendingCount);
        for(uint256 i = 0; i < pendingCount; i++) {
            pending[i] = tempPending[i];
        }
        
        return pending;
    }

    /**
        @notice Reset authentication for a user (only callable by main wallet)
        @dev This clears all approvals and authentication status
     */
    function resetAuthentication() public {
        Data storage data = userData[msg.sender];
        
        // Check if user is registered
        if(data.mainWallet == address(0)) revert UserNotRegistered();
        
        // Only the main wallet can reset
        if(data.mainWallet != msg.sender) revert OnlyMainWalletCanReset();
        
        uint256 opId = data.opId;
        
        // Reset approval and rejection counts and authentication status
        data.approvalCount = 0;
        data.rejectionCount = 0;
        data.isAuthenticated = false;
        data.isRejected = false;
        operationData[opId].approvalCount = 0;
        operationData[opId].rejectionCount = 0;
        operationData[opId].isAuthenticated = false;
        operationData[opId].isRejected = false;
        
        // Reset global authentication status
        userAuthentication[msg.sender] = false;
        
        // Clear individual approvals and rejections
        for(uint256 i = 0; i < 3; i++) {
            hasApproved[opId][data.authWallets[i]] = false;
            hasRejected[opId][data.authWallets[i]] = false;
        }
        
        emit AuthenticationReset(opId, msg.sender);
    }}

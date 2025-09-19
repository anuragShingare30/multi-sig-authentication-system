export const ABI = [
    { "type": "constructor", "inputs": [], "stateMutability": "nonpayable" },
    {
      "type": "function",
      "name": "MAX_APPROVAL_COUNT",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "approve",
      "inputs": [
        { "name": "operationId", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "authWalletOperations",
      "inputs": [
        { "name": "authWallet", "type": "address", "internalType": "address" },
        { "name": "", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [
        { "name": "operationIds", "type": "uint256", "internalType": "uint256" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getAllPendingOperations",
      "inputs": [],
      "outputs": [
        { "name": "", "type": "uint256[]", "internalType": "uint256[]" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getApprovalCount",
      "inputs": [
        { "name": "user", "type": "address", "internalType": "address" }
      ],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getApprovalStatus",
      "inputs": [
        { "name": "operationId", "type": "uint256", "internalType": "uint256" },
        { "name": "authWallet", "type": "address", "internalType": "address" }
      ],
      "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getAuthWalletOperations",
      "inputs": [
        { "name": "authWallet", "type": "address", "internalType": "address" }
      ],
      "outputs": [
        { "name": "", "type": "uint256[]", "internalType": "uint256[]" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getOperationData",
      "inputs": [
        { "name": "operationId", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [
        {
          "name": "",
          "type": "tuple",
          "internalType": "struct AuthWallet.Data",
          "components": [
            { "name": "opId", "type": "uint256", "internalType": "uint256" },
            {
              "name": "mainWallet",
              "type": "address",
              "internalType": "address"
            },
            {
              "name": "authWallets",
              "type": "address[3]",
              "internalType": "address[3]"
            },
            {
              "name": "approvalCount",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "rejectionCount",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "isAuthenticated",
              "type": "bool",
              "internalType": "bool"
            },
            { "name": "isRejected", "type": "bool", "internalType": "bool" }
          ]
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getPendingOperations",
      "inputs": [
        { "name": "authWallet", "type": "address", "internalType": "address" }
      ],
      "outputs": [
        { "name": "", "type": "uint256[]", "internalType": "uint256[]" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getRejectionCount",
      "inputs": [
        { "name": "user", "type": "address", "internalType": "address" }
      ],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getUserData",
      "inputs": [
        { "name": "user", "type": "address", "internalType": "address" }
      ],
      "outputs": [
        {
          "name": "",
          "type": "tuple",
          "internalType": "struct AuthWallet.Data",
          "components": [
            { "name": "opId", "type": "uint256", "internalType": "uint256" },
            {
              "name": "mainWallet",
              "type": "address",
              "internalType": "address"
            },
            {
              "name": "authWallets",
              "type": "address[3]",
              "internalType": "address[3]"
            },
            {
              "name": "approvalCount",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "rejectionCount",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "isAuthenticated",
              "type": "bool",
              "internalType": "bool"
            },
            { "name": "isRejected", "type": "bool", "internalType": "bool" }
          ]
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "hasApproved",
      "inputs": [
        { "name": "operationId", "type": "uint256", "internalType": "uint256" },
        { "name": "authWallet", "type": "address", "internalType": "address" }
      ],
      "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "hasAuthWalletApproved",
      "inputs": [
        { "name": "operationId", "type": "uint256", "internalType": "uint256" },
        { "name": "authWallet", "type": "address", "internalType": "address" }
      ],
      "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "hasAuthWalletRejected",
      "inputs": [
        { "name": "operationId", "type": "uint256", "internalType": "uint256" },
        { "name": "authWallet", "type": "address", "internalType": "address" }
      ],
      "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "hasRejected",
      "inputs": [
        { "name": "operationId", "type": "uint256", "internalType": "uint256" },
        { "name": "authWallet", "type": "address", "internalType": "address" }
      ],
      "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "isAuthenticated",
      "inputs": [
        { "name": "user", "type": "address", "internalType": "address" }
      ],
      "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "isRejected",
      "inputs": [
        { "name": "user", "type": "address", "internalType": "address" }
      ],
      "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "isThresholdMet",
      "inputs": [
        { "name": "user", "type": "address", "internalType": "address" }
      ],
      "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "notApprove",
      "inputs": [
        { "name": "operationId", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "operationData",
      "inputs": [
        { "name": "operationId", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [
        { "name": "opId", "type": "uint256", "internalType": "uint256" },
        { "name": "mainWallet", "type": "address", "internalType": "address" },
        {
          "name": "approvalCount",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "rejectionCount",
          "type": "uint256",
          "internalType": "uint256"
        },
        { "name": "isAuthenticated", "type": "bool", "internalType": "bool" },
        { "name": "isRejected", "type": "bool", "internalType": "bool" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "register",
      "inputs": [
        { "name": "", "type": "address", "internalType": "address" },
        {
          "name": "authWallets",
          "type": "address[3]",
          "internalType": "address[3]"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "resetAuthentication",
      "inputs": [],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "s_operationId",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "userAuthentication",
      "inputs": [
        { "name": "user", "type": "address", "internalType": "address" }
      ],
      "outputs": [
        { "name": "isAuthenticated", "type": "bool", "internalType": "bool" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "userData",
      "inputs": [
        { "name": "user", "type": "address", "internalType": "address" }
      ],
      "outputs": [
        { "name": "opId", "type": "uint256", "internalType": "uint256" },
        { "name": "mainWallet", "type": "address", "internalType": "address" },
        {
          "name": "approvalCount",
          "type": "uint256",
          "internalType": "uint256"
        },
        {
          "name": "rejectionCount",
          "type": "uint256",
          "internalType": "uint256"
        },
        { "name": "isAuthenticated", "type": "bool", "internalType": "bool" },
        { "name": "isRejected", "type": "bool", "internalType": "bool" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "event",
      "name": "ApprovalGranted",
      "inputs": [
        {
          "name": "operationID",
          "type": "uint256",
          "indexed": true,
          "internalType": "uint256"
        },
        {
          "name": "authWallet",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "mainWallet",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "approvalCount",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "AuthenticationReset",
      "inputs": [
        {
          "name": "operationID",
          "type": "uint256",
          "indexed": true,
          "internalType": "uint256"
        },
        {
          "name": "mainWallet",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "RejectionGranted",
      "inputs": [
        {
          "name": "operationID",
          "type": "uint256",
          "indexed": true,
          "internalType": "uint256"
        },
        {
          "name": "authWallet",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "mainWallet",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "rejectionCount",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "UserAuthenticated",
      "inputs": [
        {
          "name": "operationID",
          "type": "uint256",
          "indexed": true,
          "internalType": "uint256"
        },
        {
          "name": "mainWallet",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "UserRegistered",
      "inputs": [
        {
          "name": "operationID",
          "type": "uint256",
          "indexed": true,
          "internalType": "uint256"
        },
        {
          "name": "mainWallet",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "authWallets",
          "type": "address[3]",
          "indexed": false,
          "internalType": "address[3]"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "UserRejected",
      "inputs": [
        {
          "name": "operationID",
          "type": "uint256",
          "indexed": true,
          "internalType": "uint256"
        },
        {
          "name": "mainWallet",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        }
      ],
      "anonymous": false
    },
    { "type": "error", "name": "AlreadyApproved", "inputs": [] },
    { "type": "error", "name": "AlreadyRejected", "inputs": [] },
    { "type": "error", "name": "AlreadyVoted", "inputs": [] },
    { "type": "error", "name": "InvalidOperationId", "inputs": [] },
    { "type": "error", "name": "NotAnAuthWallet", "inputs": [] },
    { "type": "error", "name": "OnlyMainWalletCanReset", "inputs": [] },
    { "type": "error", "name": "OperationNotActive", "inputs": [] },
    { "type": "error", "name": "UserAlreadyAuthenticated", "inputs": [] },
    { "type": "error", "name": "UserAlreadyRejected", "inputs": [] },
    { "type": "error", "name": "UserNotRegistered", "inputs": [] }
  ];
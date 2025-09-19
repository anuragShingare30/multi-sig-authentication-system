// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/AuthWallet.sol";

contract AuthWalletTest is Test {
    AuthWallet public authWallet;
    
    address public mainWallet;
    address public authWallet1;
    address public authWallet2;
    address public authWallet3;
    address public unauthorizedWallet;
    
    event UserRegistered(uint256 indexed operationID, address indexed mainWallet, address[3] authWallets);
    event ApprovalGranted(uint256 indexed operationID, address indexed authWallet, address indexed mainWallet, uint256 approvalCount);
    event RejectionGranted(uint256 indexed operationID, address indexed authWallet, address indexed mainWallet, uint256 rejectionCount);
    event UserAuthenticated(uint256 indexed operationID, address indexed mainWallet);
    event UserRejected(uint256 indexed operationID, address indexed mainWallet);
    event AuthenticationReset(uint256 indexed operationID, address indexed mainWallet);

    function setUp() public {
        authWallet = new AuthWallet();
        
        mainWallet = makeAddr("mainWallet");
        authWallet1 = makeAddr("authWallet1");
        authWallet2 = makeAddr("authWallet2");
        authWallet3 = makeAddr("authWallet3");
        unauthorizedWallet = makeAddr("unauthorizedWallet");
    }

    function test_RegisterUser() public {
        address[3] memory authWallets = [authWallet1, authWallet2, authWallet3];
        
        vm.expectEmit(true, true, false, true);
        emit UserRegistered(1, mainWallet, authWallets);
        
        vm.prank(mainWallet);
        authWallet.register(mainWallet, authWallets);
        
        // Check user data
        AuthWallet.Data memory userData = authWallet.getUserData(mainWallet);
        assertEq(userData.opId, 1);
        assertEq(userData.mainWallet, mainWallet);
        assertEq(userData.authWallets[0], authWallet1);
        assertEq(userData.authWallets[1], authWallet2);
        assertEq(userData.authWallets[2], authWallet3);
        assertEq(userData.approvalCount, 0);
        
        // Check that user is not authenticated yet
        assertFalse(authWallet.isAuthenticated(mainWallet));
    }

    function test_RegisterUser_RevertIfSimilarAuthWallets() public {
        address[3] memory authWallets = [authWallet1, authWallet1, authWallet3]; // duplicate
        
        vm.prank(mainWallet);
        vm.expectRevert("Auth wallets must be different!!!");
        authWallet.register(mainWallet, authWallets);
    }

    function test_RegisterUser_RevertIfMainWalletIsAuthWallet() public {
        address[3] memory authWallets = [mainWallet, authWallet2, authWallet3]; // main wallet in auth wallets
        
        vm.prank(mainWallet);
        vm.expectRevert("Main wallet cannot be an auth wallet!!!");
        authWallet.register(mainWallet, authWallets);
    }

    function test_RegisterUser_RevertIfAlreadyAuthenticated() public {
        address[3] memory authWallets = [authWallet1, authWallet2, authWallet3];
        
        // Register user first
        vm.prank(mainWallet);
        authWallet.register(mainWallet, authWallets);
        
        // Get 2 approvals to authenticate
        vm.prank(authWallet1);
        authWallet.approve(1);
        
        vm.prank(authWallet2);
        authWallet.approve(1);
        
        // Try to register again
        vm.prank(mainWallet);
        vm.expectRevert(AuthWallet.UserAlreadyAuthenticated.selector);
        authWallet.register(mainWallet, authWallets);
    }

    function test_Approve_SingleApproval() public {
        address[3] memory authWallets = [authWallet1, authWallet2, authWallet3];
        
        vm.prank(mainWallet);
        authWallet.register(mainWallet, authWallets);
        
        vm.expectEmit(true, true, true, true);
        emit ApprovalGranted(1, authWallet1, mainWallet, 1);
        
        vm.prank(authWallet1);
        authWallet.approve(1); // Now requires operationId
        
        // Check approval count
        assertEq(authWallet.getApprovalCount(mainWallet), 1);
        assertTrue(authWallet.hasAuthWalletApproved(1, authWallet1));
        assertFalse(authWallet.isAuthenticated(mainWallet));
        assertFalse(authWallet.isThresholdMet(mainWallet));
    }

    function test_Approve_ReachThreshold() public {
        address[3] memory authWallets = [authWallet1, authWallet2, authWallet3];
        
        vm.prank(mainWallet);
        authWallet.register(mainWallet, authWallets);
        
        // First approval
        vm.prank(authWallet1);
        authWallet.approve(1);
        
        // Second approval should trigger authentication
        vm.expectEmit(true, true, true, true);
        emit ApprovalGranted(1, authWallet2, mainWallet, 2);
        
        vm.expectEmit(true, true, false, true);
        emit UserAuthenticated(1, mainWallet);
        
        vm.prank(authWallet2);
        authWallet.approve(1);
        
        // Check authentication status
        assertEq(authWallet.getApprovalCount(mainWallet), 2);
        assertTrue(authWallet.isAuthenticated(mainWallet));
        assertTrue(authWallet.isThresholdMet(mainWallet));
    }

    function test_Approve_RevertIfNotAuthWallet() public {
        address[3] memory authWallets = [authWallet1, authWallet2, authWallet3];
        
        vm.prank(mainWallet);
        authWallet.register(mainWallet, authWallets);
        
        vm.prank(unauthorizedWallet);
        vm.expectRevert(AuthWallet.NotAnAuthWallet.selector);
        authWallet.approve(1);
    }

    function test_Approve_RevertIfAlreadyApproved() public {
        address[3] memory authWallets = [authWallet1, authWallet2, authWallet3];
        
        vm.prank(mainWallet);
        authWallet.register(mainWallet, authWallets);
        
        // First approval
        vm.prank(authWallet1);
        authWallet.approve(1);
        
        // Try to approve again with same wallet
        vm.prank(authWallet1);
        vm.expectRevert(AuthWallet.AlreadyApproved.selector);
        authWallet.approve(1);
    }

    function test_Approve_RevertIfUserAlreadyAuthenticated() public {
        address[3] memory authWallets = [authWallet1, authWallet2, authWallet3];
        
        vm.prank(mainWallet);
        authWallet.register(mainWallet, authWallets);
        
        // Get 2 approvals to authenticate
        vm.prank(authWallet1);
        authWallet.approve(1);
        
        vm.prank(authWallet2);
        authWallet.approve(1);
        
        // Try third approval
        vm.prank(authWallet3);
        vm.expectRevert(AuthWallet.UserAlreadyAuthenticated.selector);
        authWallet.approve(1);
    }

    function test_ResetAuthentication() public {
        address[3] memory authWallets = [authWallet1, authWallet2, authWallet3];
        
        vm.prank(mainWallet);
        authWallet.register(mainWallet, authWallets);
        
        // Get 2 approvals to authenticate
        vm.prank(authWallet1);
        authWallet.approve(1);
        
        vm.prank(authWallet2);
        authWallet.approve(1);
        
        assertTrue(authWallet.isAuthenticated(mainWallet));
        
        // Reset authentication
        vm.expectEmit(true, true, false, true);
        emit AuthenticationReset(1, mainWallet);
        
        vm.prank(mainWallet);
        authWallet.resetAuthentication();
        
        // Check reset state
        assertFalse(authWallet.isAuthenticated(mainWallet));
        assertEq(authWallet.getApprovalCount(mainWallet), 0);
        assertFalse(authWallet.hasAuthWalletApproved(1, authWallet1));
        assertFalse(authWallet.hasAuthWalletApproved(1, authWallet2));
        assertFalse(authWallet.isThresholdMet(mainWallet));
    }

    function test_ResetAuthentication_RevertIfNotMainWallet() public {
        address[3] memory authWallets = [authWallet1, authWallet2, authWallet3];
        
        vm.prank(mainWallet);
        authWallet.register(mainWallet, authWallets);
        
        // Try to reset from auth wallet (not main wallet)
        vm.prank(authWallet1);
        vm.expectRevert(AuthWallet.UserNotRegistered.selector); // Auth wallet has no userData
        authWallet.resetAuthentication();
    }

    function test_ResetAuthentication_RevertIfUserNotRegistered() public {
        vm.prank(mainWallet);
        vm.expectRevert(AuthWallet.UserNotRegistered.selector);
        authWallet.resetAuthentication();
    }

    function test_GetterFunctions() public {
        address[3] memory authWallets = [authWallet1, authWallet2, authWallet3];
        
        vm.prank(mainWallet);
        authWallet.register(mainWallet, authWallets);
        
        vm.prank(authWallet1);
        authWallet.approve(1);
        
        // Test getter functions
        AuthWallet.Data memory userData = authWallet.getUserData(mainWallet);
        assertEq(userData.opId, 1);
        assertEq(userData.mainWallet, mainWallet);
        assertEq(userData.approvalCount, 1);
        
        assertTrue(authWallet.hasAuthWalletApproved(1, authWallet1));
        assertFalse(authWallet.hasAuthWalletApproved(1, authWallet2));
        
        assertEq(authWallet.getApprovalCount(mainWallet), 1);
        assertFalse(authWallet.isThresholdMet(mainWallet));
        assertFalse(authWallet.isAuthenticated(mainWallet));
    }

    function test_MultipleUsersRegistration() public {
        address mainWallet2 = makeAddr("mainWallet2");
        address[3] memory authWallets1 = [authWallet1, authWallet2, authWallet3];
        address[3] memory authWallets2 = [makeAddr("auth2_1"), makeAddr("auth2_2"), makeAddr("auth2_3")];
        
        // Register first user
        vm.prank(mainWallet);
        authWallet.register(mainWallet, authWallets1);
        
        // Register second user
        vm.prank(mainWallet2);
        authWallet.register(mainWallet2, authWallets2);
        
        // Check operation IDs are different
        assertEq(authWallet.getUserData(mainWallet).opId, 1);
        assertEq(authWallet.getUserData(mainWallet2).opId, 2);
        
        // Authenticate first user
        vm.prank(authWallet1);
        authWallet.approve(1);
        
        vm.prank(authWallet2);
        authWallet.approve(1);
        
        assertTrue(authWallet.isAuthenticated(mainWallet));
        assertFalse(authWallet.isAuthenticated(mainWallet2));
    }

    function test_GetPendingOperations() public {
        address[3] memory authWallets = [authWallet1, authWallet2, authWallet3];
        
        vm.prank(mainWallet);
        authWallet.register(mainWallet, authWallets);
        
        // Check pending operations for authWallet1
        uint256[] memory pending = authWallet.getPendingOperations(authWallet1);
        assertEq(pending.length, 1);
        assertEq(pending[0], 1);
        
        // Approve from authWallet1
        vm.prank(authWallet1);
        authWallet.approve(1);
        
        // Check pending operations again - should be empty for authWallet1
        pending = authWallet.getPendingOperations(authWallet1);
        assertEq(pending.length, 0);
        
        // But authWallet2 should still have pending
        pending = authWallet.getPendingOperations(authWallet2);
        assertEq(pending.length, 1);
        assertEq(pending[0], 1);
    }

    function test_SameAuthWalletMultipleUsers() public {
        address mainWallet2 = makeAddr("mainWallet2");
        address[3] memory authWallets1 = [authWallet1, authWallet2, authWallet3];
        address[3] memory authWallets2 = [authWallet1, makeAddr("auth2_2"), makeAddr("auth2_3")]; // authWallet1 is shared
        
        // Register both users
        vm.prank(mainWallet);
        authWallet.register(mainWallet, authWallets1);
        
        vm.prank(mainWallet2);
        authWallet.register(mainWallet2, authWallets2);
        
        // Check that authWallet1 has 2 pending operations
        uint256[] memory pending = authWallet.getPendingOperations(authWallet1);
        assertEq(pending.length, 2);
        assertEq(pending[0], 1);
        assertEq(pending[1], 2);
        
        // AuthWallet1 approves operation 1
        vm.prank(authWallet1);
        authWallet.approve(1);
        
        // Now authWallet1 should have only 1 pending (operation 2)
        pending = authWallet.getPendingOperations(authWallet1);
        assertEq(pending.length, 1);
        assertEq(pending[0], 2);
        
        // AuthWallet1 can also approve operation 2
        vm.prank(authWallet1);
        authWallet.approve(2);
        
        // Now no pending operations for authWallet1
        pending = authWallet.getPendingOperations(authWallet1);
        assertEq(pending.length, 0);
    }

    function test_ApproveInvalidOperationId() public {
        vm.prank(authWallet1);
        vm.expectRevert(AuthWallet.InvalidOperationId.selector);
        authWallet.approve(999); // Non-existent operation
    }

    function test_GetAllPendingOperations() public {
        address mainWallet2 = makeAddr("mainWallet2");
        address[3] memory authWallets1 = [authWallet1, authWallet2, authWallet3];
        address[3] memory authWallets2 = [makeAddr("auth2_1"), makeAddr("auth2_2"), makeAddr("auth2_3")];
        
        // Register two users
        vm.prank(mainWallet);
        authWallet.register(mainWallet, authWallets1);
        
        vm.prank(mainWallet2);
        authWallet.register(mainWallet2, authWallets2);
        
        // Check all pending operations
        uint256[] memory allPending = authWallet.getAllPendingOperations();
        assertEq(allPending.length, 2);
        assertEq(allPending[0], 1);
        assertEq(allPending[1], 2);
        
        // Authenticate first user
        vm.prank(authWallet1);
        authWallet.approve(1);
        vm.prank(authWallet2);
        authWallet.approve(1);
        
        // Now only operation 2 should be pending
        allPending = authWallet.getAllPendingOperations();
        assertEq(allPending.length, 1);
        assertEq(allPending[0], 2);
    }

    function test_NotApprove_SingleRejection() public {
        address[3] memory authWallets = [authWallet1, authWallet2, authWallet3];
        
        vm.prank(mainWallet);
        authWallet.register(mainWallet, authWallets);
        
        vm.expectEmit(true, true, true, true);
        emit RejectionGranted(1, authWallet1, mainWallet, 1);
        
        vm.prank(authWallet1);
        authWallet.notApprove(1);
        
        // Check rejection count
        assertEq(authWallet.getRejectionCount(mainWallet), 1);
        assertTrue(authWallet.hasAuthWalletRejected(1, authWallet1));
        assertFalse(authWallet.isAuthenticated(mainWallet));
        assertFalse(authWallet.isRejected(mainWallet));
    }

    function test_NotApprove_ReachRejectionThreshold() public {
        address[3] memory authWallets = [authWallet1, authWallet2, authWallet3];
        
        vm.prank(mainWallet);
        authWallet.register(mainWallet, authWallets);
        
        // First rejection
        vm.prank(authWallet1);
        authWallet.notApprove(1);
        
        // Second rejection should trigger rejection
        vm.expectEmit(true, true, true, true);
        emit RejectionGranted(1, authWallet2, mainWallet, 2);
        
        vm.expectEmit(true, true, false, true);
        emit UserRejected(1, mainWallet);
        
        vm.prank(authWallet2);
        authWallet.notApprove(1);
        
        // Check rejection status
        assertEq(authWallet.getRejectionCount(mainWallet), 2);
        assertTrue(authWallet.isRejected(mainWallet));
        assertFalse(authWallet.isAuthenticated(mainWallet));
    }

    function test_MixedVoting_ApprovalWins() public {
        address[3] memory authWallets = [authWallet1, authWallet2, authWallet3];
        
        vm.prank(mainWallet);
        authWallet.register(mainWallet, authWallets);
        
        // First vote: approval
        vm.prank(authWallet1);
        authWallet.approve(1);
        
        // Second vote: rejection
        vm.prank(authWallet2);
        authWallet.notApprove(1);
        
        // Third vote: approval (should win 2-1)
        vm.expectEmit(true, true, false, true);
        emit UserAuthenticated(1, mainWallet);
        
        vm.prank(authWallet3);
        authWallet.approve(1);
        
        // Check final status
        assertEq(authWallet.getApprovalCount(mainWallet), 2);
        assertEq(authWallet.getRejectionCount(mainWallet), 1);
        assertTrue(authWallet.isAuthenticated(mainWallet));
        assertFalse(authWallet.isRejected(mainWallet));
    }

    function test_MixedVoting_RejectionWins() public {
        address[3] memory authWallets = [authWallet1, authWallet2, authWallet3];
        
        vm.prank(mainWallet);
        authWallet.register(mainWallet, authWallets);
        
        // First vote: approval
        vm.prank(authWallet1);
        authWallet.approve(1);
        
        // Second vote: rejection
        vm.prank(authWallet2);
        authWallet.notApprove(1);
        
        // Third vote: rejection (should win 2-1)
        vm.expectEmit(true, true, false, true);
        emit UserRejected(1, mainWallet);
        
        vm.prank(authWallet3);
        authWallet.notApprove(1);
        
        // Check final status
        assertEq(authWallet.getApprovalCount(mainWallet), 1);
        assertEq(authWallet.getRejectionCount(mainWallet), 2);
        assertFalse(authWallet.isAuthenticated(mainWallet));
        assertTrue(authWallet.isRejected(mainWallet));
    }

    function test_DoubleVoting_RevertOnApprovalAfterApproval() public {
        address[3] memory authWallets = [authWallet1, authWallet2, authWallet3];
        
        vm.prank(mainWallet);
        authWallet.register(mainWallet, authWallets);
        
        // First approval
        vm.prank(authWallet1);
        authWallet.approve(1);
        
        // Try to approve again
        vm.prank(authWallet1);
        vm.expectRevert(AuthWallet.AlreadyApproved.selector);
        authWallet.approve(1);
    }

    function test_DoubleVoting_RevertOnRejectionAfterApproval() public {
        address[3] memory authWallets = [authWallet1, authWallet2, authWallet3];
        
        vm.prank(mainWallet);
        authWallet.register(mainWallet, authWallets);
        
        // First approval
        vm.prank(authWallet1);
        authWallet.approve(1);
        
        // Try to reject after approval
        vm.prank(authWallet1);
        vm.expectRevert(AuthWallet.AlreadyVoted.selector);
        authWallet.notApprove(1);
    }

    function test_DoubleVoting_RevertOnApprovalAfterRejection() public {
        address[3] memory authWallets = [authWallet1, authWallet2, authWallet3];
        
        vm.prank(mainWallet);
        authWallet.register(mainWallet, authWallets);
        
        // First rejection
        vm.prank(authWallet1);
        authWallet.notApprove(1);
        
        // Try to approve after rejection
        vm.prank(authWallet1);
        vm.expectRevert(AuthWallet.AlreadyVoted.selector);
        authWallet.approve(1);
    }

    function test_DoubleVoting_RevertOnRejectionAfterRejection() public {
        address[3] memory authWallets = [authWallet1, authWallet2, authWallet3];
        
        vm.prank(mainWallet);
        authWallet.register(mainWallet, authWallets);
        
        // First rejection
        vm.prank(authWallet1);
        authWallet.notApprove(1);
        
        // Try to reject again
        vm.prank(authWallet1);
        vm.expectRevert(AuthWallet.AlreadyRejected.selector);
        authWallet.notApprove(1);
    }

    function test_VotingAfterAuthenticated() public {
        address[3] memory authWallets = [authWallet1, authWallet2, authWallet3];
        
        vm.prank(mainWallet);
        authWallet.register(mainWallet, authWallets);
        
        // Get authenticated
        vm.prank(authWallet1);
        authWallet.approve(1);
        
        vm.prank(authWallet2);
        authWallet.approve(1);
        
        assertTrue(authWallet.isAuthenticated(mainWallet));
        
        // Try to vote after authentication
        vm.prank(authWallet3);
        vm.expectRevert(AuthWallet.UserAlreadyAuthenticated.selector);
        authWallet.approve(1);
        
        vm.prank(authWallet3);
        vm.expectRevert(AuthWallet.UserAlreadyAuthenticated.selector);
        authWallet.notApprove(1);
    }

    function test_VotingAfterRejected() public {
        address[3] memory authWallets = [authWallet1, authWallet2, authWallet3];
        
        vm.prank(mainWallet);
        authWallet.register(mainWallet, authWallets);
        
        // Get rejected
        vm.prank(authWallet1);
        authWallet.notApprove(1);
        
        vm.prank(authWallet2);
        authWallet.notApprove(1);
        
        assertTrue(authWallet.isRejected(mainWallet));
        
        // Try to vote after rejection
        vm.prank(authWallet3);
        vm.expectRevert(AuthWallet.UserAlreadyRejected.selector);
        authWallet.approve(1);
        
        vm.prank(authWallet3);
        vm.expectRevert(AuthWallet.UserAlreadyRejected.selector);
        authWallet.notApprove(1);
    }

    function test_GetPendingOperations_WithVoting() public {
        address[3] memory authWallets = [authWallet1, authWallet2, authWallet3];
        
        vm.prank(mainWallet);
        authWallet.register(mainWallet, authWallets);
        
        // Initially all should have pending operations
        uint256[] memory pending = authWallet.getPendingOperations(authWallet1);
        assertEq(pending.length, 1);
        
        // AuthWallet1 votes (approve)
        vm.prank(authWallet1);
        authWallet.approve(1);
        
        // AuthWallet1 should have no pending operations
        pending = authWallet.getPendingOperations(authWallet1);
        assertEq(pending.length, 0);
        
        // AuthWallet2 should still have pending
        pending = authWallet.getPendingOperations(authWallet2);
        assertEq(pending.length, 1);
    }
}
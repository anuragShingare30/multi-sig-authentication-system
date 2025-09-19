// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script} from "../lib/forge-std/src/Script.sol";
import {console} from "../lib/forge-std/src/console.sol";
import {AuthWallet} from "../src/AuthWallet.sol";

contract AuthWalletScript is Script {
    uint256 public privateKey = vm.envUint("ANVIL_PRIVATE_KEY");
    AuthWallet public authWallet;
    function run() public {
        vm.startBroadcast(privateKey);
        authWallet = new AuthWallet();
        vm.stopBroadcast();

        console.log("contract address:", address(authWallet));
    }
}
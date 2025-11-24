// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Test.sol";
import "../src/LukasToken.sol";

contract LukasTokenTest is Test {
    LukasToken public token;
    address public alice = address(0x1);
    address public bob = address(0x2);
    
    function setUp() public {
        token = new LukasToken(1000000 * 10**18);
    }
    
    function testInitialSupply() public {
        assertEq(token.totalSupply(), 1000000 * 10**18);
        assertEq(token.balanceOf(address(this)), 1000000 * 10**18);
    }
    
    function testTransfer() public {
        token.transfer(alice, 1000 * 10**18);
        assertEq(token.balanceOf(alice), 1000 * 10**18);
    }
    
    function testApproveAndTransferFrom() public {
        token.transfer(alice, 1000 * 10**18);
        
        vm.prank(alice);
        token.approve(bob, 500 * 10**18);
        
        vm.prank(bob);
        token.transferFrom(alice, bob, 500 * 10**18);
        
        assertEq(token.balanceOf(bob), 500 * 10**18);
        assertEq(token.balanceOf(alice), 500 * 10**18);
    }
}

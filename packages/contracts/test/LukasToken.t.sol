// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/LukasToken.sol";

/**
 * @title LukasTokenTest
 * @notice Tests for the LUKAS token with mint/burn controls
 */
contract LukasTokenTest is Test {
    LukasToken public token;
    address public owner = address(this);
    address public minter = address(0x1);
    address public user1 = address(0x2);
    address public user2 = address(0x3);

    function setUp() public {
        token = new LukasToken(1_000_000e18);
    }

    function test_InitialSupply() public view {
        assertEq(token.totalSupply(), 1_000_000e18);
        assertEq(token.balanceOf(owner), 1_000_000e18);
    }

    function test_TokenMetadata() public view {
        assertEq(token.name(), "LUKAS");
        assertEq(token.symbol(), "LKS");
        assertEq(token.decimals(), 18);
    }

    function test_Transfer() public {
        token.transfer(user1, 100e18);
        assertEq(token.balanceOf(user1), 100e18);
        assertEq(token.balanceOf(owner), 1_000_000e18 - 100e18);
    }

    function test_TransferFrom() public {
        token.approve(user1, 100e18);
        
        vm.prank(user1);
        token.transferFrom(owner, user2, 50e18);
        
        assertEq(token.balanceOf(user2), 50e18);
        assertEq(token.allowance(owner, user1), 50e18);
    }

    function test_SetMinter() public {
        token.setMinter(minter);
        assertEq(token.minter(), minter);
    }

    function test_OnlyOwnerCanSetMinter() public {
        vm.prank(user1);
        vm.expectRevert(LukasToken.Unauthorized.selector);
        token.setMinter(minter);
    }

    function test_MinterCanMint() public {
        token.setMinter(minter);
        
        vm.prank(minter);
        token.mint(user1, 500e18);
        
        assertEq(token.balanceOf(user1), 500e18);
        assertEq(token.totalSupply(), 1_000_000e18 + 500e18);
    }

    function test_OnlyMinterCanMint() public {
        token.setMinter(minter);
        
        vm.prank(user1);
        vm.expectRevert(LukasToken.Unauthorized.selector);
        token.mint(user2, 100e18);
    }

    function test_MinterCanBurn() public {
        token.setMinter(minter);
        token.transfer(user1, 100e18);
        
        vm.prank(minter);
        token.burn(user1, 50e18);
        
        assertEq(token.balanceOf(user1), 50e18);
        assertEq(token.totalSupply(), 1_000_000e18 - 50e18);
    }

    function test_BurnFrom() public {
        token.transfer(user1, 100e18);
        
        vm.prank(user1);
        token.burnFrom(30e18);
        
        assertEq(token.balanceOf(user1), 70e18);
        assertEq(token.totalSupply(), 1_000_000e18 - 30e18);
    }

    function test_TransferOwnership() public {
        token.transferOwnership(user1);
        assertEq(token.owner(), user1);
    }

    function test_CannotSetZeroAddressMinter() public {
        vm.expectRevert(LukasToken.ZeroAddress.selector);
        token.setMinter(address(0));
    }

    function test_InsufficientBalanceTransfer() public {
        vm.prank(user1);
        vm.expectRevert(LukasToken.InsufficientBalance.selector);
        token.transfer(user2, 100e18);
    }
}

#![cfg_attr(not(feature = "export-abi"), no_main)]
extern crate alloc;

use alloy_primitives::{Address, U256};
use alloy_sol_types::sol;
use stylus_sdk::{evm, msg, prelude::*};

sol_storage! {
    #[entrypoint]
    pub struct ApiAuthorization {
        mapping(address => uint256) accessings;
    }
}

sol! {
    event Purchase(address addr, uint256 accessings);
}

#[public]
impl ApiAuthorization {
    #[payable]
    pub fn purchase(&mut self) -> U256 {
        let sender = msg::sender();
        let price = U256::from(2_180_330_000_000_000u128);

        let purchased = msg::value()
            .checked_div(price)
            .expect("division by zero");

        assert!(purchased > U256::from(0), "insufficient payment");

        let current = self.accessings.get(sender);
        let updated = current.checked_add(purchased).expect("overflow");

        self.accessings.setter(sender).set(updated);

        evm::log(Purchase {
            addr: sender,
            accessings: updated,
        });

        updated
    }

    pub fn balance_of(&self, address: Address) -> U256 {
        self.accessings.get(address)
    }

    pub fn mark_usage(&mut self, address: Address) -> U256 {
        let current = self.accessings.get(address);
        assert!(current > U256::from(0), "no remaining access");

        let updated = current.checked_sub(U256::from(1)).expect("underflow");
        self.accessings.setter(address).set(updated);
        updated
    }
}

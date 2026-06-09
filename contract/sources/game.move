module game_addr::amethyst_mine {
    use std::signer;
    use std::string;
    use cedra_framework::coin::{Self, MintCapability, BurnCapability};
    use cedra_framework::cedra_account;
    use cedra_framework::table::{Self, Table};

    const EAMY_EMPTY: u64 = 1;
    const EPROFILE_NOT_FOUND: u64 = 2;
    const EMAX_LEVEL_REACHED: u64 = 3;
    const EPROFILE_ALREADY_EXISTS: u64 = 4;

    struct AME {}

    struct MineGlobal has key {
        remaining_amethysts: u64,
        mint_cap: MintCapability<AME>,
        burn_cap: BurnCapability<AME>,
        profiles: Table<address, PlayerProfile>, 
    }

    struct PlayerProfile has store, drop {
        pickaxe_level: u64,
        sword_level: u64,
    }

    fun init_module(admin: &signer) {
        let (burn_cap, freeze_cap, mint_cap) = coin::initialize<AME>(
            admin,
            string::utf8(b"AME Coin"),
            string::utf8(b"AME"),
            1, 
            false
        );

        coin::destroy_freeze_cap(freeze_cap);

        move_to(admin, MineGlobal {
            remaining_amethysts: 100000,
            mint_cap,
            burn_cap,
            profiles: table::new<address, PlayerProfile>(),
        });
    }

    public entry fun register_player(admin: &signer, player_addr: address) acquires MineGlobal {
        let mine = borrow_global_mut<MineGlobal>(signer::address_of(admin));
        assert!(!table::contains(&mine.profiles, player_addr), EPROFILE_ALREADY_EXISTS);

        let new_profile = PlayerProfile {
            pickaxe_level: 1,
            sword_level: 1,
        };
        
        table::add(&mut mine.profiles, player_addr, new_profile);
    }

    public entry fun exchange_directly_to_AME(admin: &signer, player_addr: address, amount: u64) acquires MineGlobal {
        let admin_addr = signer::address_of(admin);
        let mine = borrow_global_mut<MineGlobal>(admin_addr);
        
        assert!(table::contains(&mine.profiles, player_addr), EPROFILE_NOT_FOUND);
        
        assert!(mine.remaining_amethysts >= amount, EAMY_EMPTY);
        mine.remaining_amethysts = mine.remaining_amethysts - amount;

        let coins = coin::mint<AME>(amount, &mine.mint_cap);
        cedra_account::deposit_coins<AME>(player_addr, coins);
    }

    fun get_upgrade_cost(current_level: u64): u64 {
        if (current_level == 1) { return 100 }; 
        if (current_level == 2) { return 500 };
        if (current_level == 3) { return 1000 };
        if (current_level == 4) { return 5000 };
        return 0
    }

    public entry fun upgrade_pickaxe(admin: &signer, player_addr: address) acquires MineGlobal {
        let admin_addr = signer::address_of(admin);
        let mine = borrow_global_mut<MineGlobal>(admin_addr);
        assert!(table::contains(&mine.profiles, player_addr), EPROFILE_NOT_FOUND);

        let profile = table::borrow_mut(&mut mine.profiles, player_addr);
        let current_lv = profile.pickaxe_level;
        assert!(current_lv < 5, EMAX_LEVEL_REACHED);

        let cost = get_upgrade_cost(current_lv);

        coin::burn_from<AME>(player_addr, cost, &mine.burn_cap);

        profile.pickaxe_level = current_lv + 1;
    }

    public entry fun upgrade_sword(admin: &signer, player_addr: address) acquires MineGlobal {
        let admin_addr = signer::address_of(admin);
        let mine = borrow_global_mut<MineGlobal>(admin_addr);
        assert!(table::contains(&mine.profiles, player_addr), EPROFILE_NOT_FOUND);

        let profile = table::borrow_mut(&mut mine.profiles, player_addr);
        let current_lv = profile.sword_level;
        assert!(current_lv < 5, EMAX_LEVEL_REACHED);

        let cost = get_upgrade_cost(current_lv);
        
        coin::burn_from<AME>(player_addr, cost, &mine.burn_cap);

        profile.sword_level = current_lv + 1;
    }



    #[view]
    public fun get_player_tools(admin_addr: address, player_addr: address): (u64, u64) acquires MineGlobal {
        let mine = borrow_global<MineGlobal>(admin_addr);
        
        if (!table::contains(&mine.profiles, player_addr)) {
            return (1, 1)
        };
        
        let profile = table::borrow(&mine.profiles, player_addr);
        (profile.pickaxe_level, profile.sword_level)
    }

    #[view]
    public fun get_remaining_amethysts(admin_addr: address): u64 acquires MineGlobal {
        borrow_global<MineGlobal>(admin_addr).remaining_amethysts
    }
}

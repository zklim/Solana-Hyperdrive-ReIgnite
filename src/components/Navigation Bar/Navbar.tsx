import { Button } from "@chakra-ui/button";
import Link from "next/link";
import { useAccount } from "wagmi";

const Navbar = () => {
  const { address } = useAccount();
  return (
    <div className="flex align-middle">
      <ul className="flex text-[20px] mr-[10px] align-middle justify-center">
        <li className="mr-[10px]">
          <Button>
            <Link href="/createGrant">Create Grant</Link>
          </Button>
        </li>
        <li className="mr-[10px]">
          <Button>
            <Link href="/grants">Explore</Link>
          </Button>
        </li>
        <li>
          {address ? (
            <Button className="mr-[10px]">
              <Link href={`/profile-owner/${address}`}>Profile</Link>
            </Button>
          ) : (
            <div></div>
          )}
        </li>
        <li>
          <Button>
            <Link href="/airdrop">Retrospective Reward</Link>
          </Button>
        </li>
      </ul>
    </div>
  );
};

export default Navbar;

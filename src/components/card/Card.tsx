import {
  Card,
  CardBody,
  Stack,
  Heading,
  Divider,
  CardFooter,
  ButtonGroup,
  Button,
  Image,
  Text,
} from "@chakra-ui/react";
import {
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import Hypercert from "../../../public/Hypercert.json";
import { useState } from "react";
import { BigNumber } from "ethers";
import Timer from "../timer/Timer";
import FundingPool from "../../../public/FundingPool.json";
import {
  FUNDING_POOL_CONTRACT,
  HYPERCERT_CONTRACT,
} from "../../../utils/constants";

interface Props {
  tokenId: number;
}

const CardComponent = ({ tokenId }: Props) => {
  const [grants, setGrants] = useState<any>({});
  const { data } = useContractRead({
    address: HYPERCERT_CONTRACT.address,
    abi: HYPERCERT_CONTRACT.abi,
    functionName: "grantInfo",
    args: [BigNumber.from(BigInt(tokenId))],
    onSuccess: (data: any) => {
      console.log(data.grantEndTime.toNumber());
    },
  });

  const { config } = usePrepareContractWrite({
    address: FUNDING_POOL_CONTRACT.address,
    abi: FUNDING_POOL_CONTRACT.abi,
    functionName: "withdrawFunds",
    args: [
      BigNumber.from(BigInt(tokenId)),
      "0xC92b7A94DBc6173C186841003B0Df2eF8758d826",
    ],
  });

  const { data: data1, write } = useContractWrite(config);

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data1?.hash,
  });

  const handleSubmit = async () => {
    //call contract
    if (write) {
      write();
    }
  };

  return (
    <Card minW="xs">
      <CardBody>
        <Image
          src={`https://picsum.photos/id/${data?.grantName.charCodeAt(
            0
          )}/512/512`}
          alt="grant"
          borderRadius="lg"
          className="w-full"
        />
        <Stack mt="6" spacing="3">
          <Heading size="md">Grant name: {data?.grantName}</Heading>
          <Text>Grant End</Text>
          <Timer endDate={data?.grantEndTime.toNumber()} />
        </Stack>
      </CardBody>
      <Divider />
      <CardFooter className="flex-col">
        <ButtonGroup spacing="2">
          <Button variant="solid" colorScheme="blue" onClick={handleSubmit}>
            Withdraw Funds
          </Button>
          <Button variant="ghost" colorScheme="blue">
            Details
          </Button>
        </ButtonGroup>
        <div>
          {isLoading && <p>Waiting for transaction to be mined...</p>}
          {isSuccess && <p>Transaction was successful!</p>}
        </div>
      </CardFooter>
    </Card>
  );
};

export default CardComponent;

import { ConnectButton } from "@rainbow-me/rainbowkit";
import React, { useEffect, useState } from "react";
import { fetchHypercertBalance } from "../../graphql/queries";
import {
  paginatedIndexesConfig,
  useAccount,
  useContractInfiniteReads,
} from "wagmi";
import { HYPERCERT_CONTRACT } from "../../utils/constants";
import { fetchData } from "@/services/uploadMeta";
import clsx from "clsx";
import {
  Card,
  CardBody,
  Stack,
  Heading,
  Divider,
  CardFooter,
  Image,
  Text,
} from "@chakra-ui/react";

export default function Home() {
  const { address, status } = useAccount();
  const [balances, setBalances] = useState<any>();
  const [grants, setGrants] = useState<any>();
  const ITEMS_PER_PAGE = 12;

  const { data: grantsData, fetchNextPage } = useContractInfiniteReads({
    cacheKey: "grants-data-1",
    ...paginatedIndexesConfig(
      (index) => {
        return [
          {
            ...HYPERCERT_CONTRACT,
            functionName: "uri",
            args: [index] as const,
          },
        ];
      },
      { start: 0, perPage: ITEMS_PER_PAGE, direction: "increment" }
    ),
  });

  useEffect(() => {
    const getGrantsInfo = async () => {
      const grants = [];
      let index = 0;
      console.log({ grantsData });
      for await (const page of grantsData!.pages) {
        for await (const grantHash of page) {
          if (grantHash) {
            const data = await fetchData(grantHash as string);
            grants.push({
              id: index,
              name: data.name,
              description: data.description || "Donate to this grant!",
              image: data.image || `https://picsum.photos/id/${index}/512/512`,
            });
            index++;
          }
        }
      }

      setGrants(grants);
    };

    if (grantsData && grantsData.pages) {
      getGrantsInfo();
    }
  }, [grantsData, grantsData?.pages]);

  React.useEffect(() => {
    const getHypercertBalance = async (address: string) => {
      const data = await fetchHypercertBalance(address);

      const balances: { [key: string]: string } = {};

      data.account?.ERC1155balances?.forEach((balance: any) => {
        const identifier = balance.token.identifier;
        const valueExact = balance.token.balances[0].valueExact;
        balances[identifier] = valueExact;
      });

      console.log(balances);

      setBalances(balances);
    };

    if (status === "connected") {
      getHypercertBalance(address);
    }
  }, [address, status]);

  return status === "connected" ? (
    <div className="flex lg:flex-row flex-col items-center w-full min-h-screen h-full">
      <div className="flex flex-col w-full basis-2/5 bg-slate-100 px-8 py-12 min-h-screen h-full">
        <h1 className="font-bold text-xl">Your Profile</h1>
        <p className="font-bold my-4 text-lg">{address}</p>
        <p className="">
          Hypercerts owned: {balances ? Object.keys(balances).length : "0"}
        </p>
      </div>
      <div className="flex flex-col w-full basis-3/5 px-8 py-12 h-full min-h-screen">
        <h1 className="font-bold text-xl">Hypercerts</h1>
        <div className="grid grid-cols-3 items-center justify-center w-full gap-6 lg:gap-x-12 my-4">
          {grants &&
            grants
              .filter((item: any) => balances?.hasOwnProperty(item.id))
              .map((grant: any) => {
                return (
                  <Card minW="xs" key={grant.id} className={clsx("rounded-lg")}>
                    <CardBody>
                      <Image
                        src={grant.image}
                        alt="grant"
                        borderRadius="lg"
                        className="w-full h-full"
                      />
                      <Stack mt="6" spacing="3">
                        <Heading size="md">{grant.name}</Heading>
                        <Text>{grant.description}</Text>
                      </Stack>
                    </CardBody>
                    <Divider />
                    <CardFooter className="flex-col">
                      <p className="text-ellipsis overflow-hidden text-sm">
                        Token ID: {grant.id}
                      </p>
                    </CardFooter>
                  </Card>
                );
              })}
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
}

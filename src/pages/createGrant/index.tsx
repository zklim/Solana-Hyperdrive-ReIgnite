import NumberInputs from "@/components/Number Input/NumberInputs";
import { fetchData, uploadMetadata } from "@/services/uploadMeta";
import {
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  NumberInput,
  Button,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInputField,
  NumberInputStepper,
} from "@chakra-ui/react";
import { localhost, polygonMumbai } from "@wagmi/chains";
import { useEffect, useState } from "react";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import {
  useContractEvent,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import Hypercert from "../../../public/Hypercert.json";
import { BigNumber } from "ethers";
import { HYPERCERT_CONTRACT } from "../../../utils/constants";
import { useRouter, Router } from "next/router";

const CreateGrant = () => {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [workScope, setWorkScope] = useState<string>("");
  const [startDate, setStartDate] = useState<number>(0);
  const [endDate, setEndDate] = useState<number>(0);
  const [contributors, setContributors] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const [endGrant, setEndGrant] = useState<number>(0);
  const [projectLink, setProjectLink] = useState<string>("");
  const [state, setState] = useState<boolean>(false);

  const router = useRouter();

  const { config } = usePrepareContractWrite({
    address: HYPERCERT_CONTRACT.address,
    abi: HYPERCERT_CONTRACT.abi,
    functionName: "createGrant",
    args: [name, BigNumber.from(BigInt(endGrant)), result],
    onSuccess(test) {
      console.log(config);
    },
  });
  const { data, write } = useContractWrite(config);

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  const handleSubmit = async () => {
    //call contract

    const data = await uploadMetadata({
      title: name,
      description: description,
      image: "",
      link: projectLink,
      properties: {
        workScope: workScope,
        startDate: BigNumber.from(BigInt(startDate)),
        endDate: BigNumber.from(BigInt(endDate)),
        contributors: contributors,
        endGrant: BigNumber.from(BigInt(endGrant)),
      },
    });

    setResult(data.path);
    console.log("datapathis:", data.path);
    setState(true);

    // await fetchData("ad");
  };

  const handleSub = async () => {
    await handleSubmit();
    if (state) {
      if (write) {
        write();
      }
    }
  };

  const connector = new MetaMaskConnector({
    chains: [localhost, polygonMumbai],
  });

  useEffect(() => {
    if (isSuccess) {
      router.push("/");
    }
  }, [isSuccess]);

  return (
    <>
      <div className="flex justify-center align-middle">
        <div className="flex-col justify-center align-middle">
          <h1 className="text-[30px]">Create Grant</h1>
          <br />
          <div className="h-[500px] w-[500px]">
            {/** Box */}
            <FormControl>
              <FormLabel>Grant Name</FormLabel>
              <Input type="text" onChange={(e) => setName(e.target.value)} />
              <FormHelperText>
                Grant Name Example: Beach Cleaning
              </FormHelperText>
              <br />
              <FormLabel>Description</FormLabel>
              <Input
                type="text"
                onChange={(e) => setDescription(e.target.value)}
              />
              <FormHelperText>Decription of Grant</FormHelperText>
              <br />
              <FormLabel>Work Scope</FormLabel>
              <Input
                type="text"
                onChange={(e) => setWorkScope(e.target.value)}
              />
              <div className="flex justify-center align-middle mt-[10px] text-[20px]">
                <h1>Duration of Work</h1>
              </div>
              <div className="flex justify-between align-middle">
                <div>
                  <FormLabel>Start Work Date</FormLabel>
                  <Input
                    placeholder="Select Date and Time"
                    size="lg"
                    type="date"
                    onChange={(e) => {
                      setStartDate(new Date(e.target.value).getTime() / 1000);
                    }}
                  />
                </div>
                <div>
                  <FormLabel>End Work Date</FormLabel>
                  <Input
                    placeholder="Select Date and Time"
                    size="lg"
                    type="date"
                    onChange={(e) => {
                      setEndDate(new Date(e.target.value).getTime() / 1000);
                    }}
                  />
                </div>
              </div>
              <FormLabel>List of Contributors</FormLabel>
              <Input
                type="text"
                onChange={(e) => setContributors(e.target.value)}
              />
              <FormLabel>End of Grant</FormLabel>
              <Input
                placeholder="Select Date and Time"
                size="lg"
                type="date"
                onChange={(e) => {
                  setEndGrant(new Date(e.target.value).getTime() / 1000);
                }}
              />
              <FormLabel>Project Link</FormLabel>
              <Input
                type="text"
                onChange={(e) => setProjectLink(e.target.value)}
              />
              <FormHelperText>Link to Project (example: Github)</FormHelperText>
              <Button
                mt={4}
                colorScheme="teal"
                type="submit"
                onClick={handleSub}
              >
                Create
              </Button>
            </FormControl>
            <div>
              {isSuccess && <h1>Success Transaction</h1>}
              {isLoading && <h1>Waiting for transaction to complete</h1>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateGrant;

// ~~ Generated by projen. To modify, edit .projenrc.ts and run "npx projen".
import type { aws_route53, Duration } from 'aws-cdk-lib';

/**
 * OptionalAaaaRecordProps
 */
export interface OptionalAaaaRecordProps {
  /**
   * The target.
   * @stability stable
   */
  readonly target?: aws_route53.RecordTarget;
  /**
   * Among resource record sets that have the same combination of DNS name and type, a value that determines the proportion of DNS queries that Amazon Route 53 responds to using the current resource record set.
   * Route 53 calculates the sum of the weights for the resource record sets that have the same combination of DNS name and type.
   * Route 53 then responds to queries based on the ratio of a resource's weight to the total.
   *
   * This value can be a number between 0 and 255.
   * @default - Do not set weighted routing
   * @stability stable
   */
  readonly weight?: number;
  /**
   * The resource record cache time to live (TTL).
   * @default Duration.minutes(30)
   * @stability stable
   */
  readonly ttl?: Duration;
  /**
   * A string used to distinguish between different records with the same combination of DNS name and type.
   * It can only be set when either weight or geoLocation is defined.
   *
   * This parameter must be between 1 and 128 characters in length.
   * @default - Auto generated string
   * @stability stable
   */
  readonly setIdentifier?: string;
  /**
   * The Amazon EC2 Region where you created the resource that this resource record set refers to.
   * The resource typically is an AWS resource, such as an EC2 instance or an ELB load balancer,
   * and is referred to by an IP address or a DNS domain name, depending on the record type.
   *
   * When Amazon Route 53 receives a DNS query for a domain name and type for which you have created latency resource record sets,
   * Route 53 selects the latency resource record set that has the lowest latency between the end user and the associated Amazon EC2 Region.
   * Route 53 then returns the value that is associated with the selected resource record set.
   * @default - Do not set latency based routing
   * @stability stable
   */
  readonly region?: string;
  /**
   * The subdomain name for this record. This should be relative to the zone root name.
   * For example, if you want to create a record for acme.example.com, specify
   * "acme".
   *
   * You can also specify the fully qualified domain name which terminates with a
   * ".". For example, "acme.example.com.".
   * @default zone root
   * @stability stable
   */
  readonly recordName?: string;
  /**
   * Whether to return multiple values, such as IP addresses for your web servers, in response to DNS queries.
   * @default false
   * @stability stable
   */
  readonly multiValueAnswer?: boolean;
  /**
   * The geographical origin for this record to return DNS records based on the user's location.
   * @stability stable
   */
  readonly geoLocation?: aws_route53.GeoLocation;
  /**
   * Whether to delete the same record set in the hosted zone if it already exists (dangerous!).
   * This allows to deploy a new record set while minimizing the downtime because the
   * new record set will be created immediately after the existing one is deleted. It
   * also avoids "manual" actions to delete existing record sets.
   *
   * > **N.B.:** this feature is dangerous, use with caution! It can only be used safely when
   * > `deleteExisting` is set to `true` as soon as the resource is added to the stack. Changing
   * > an existing Record Set's `deleteExisting` property from `false -> true` after deployment
   * > will delete the record!
   * @default false
   * @stability stable
   */
  readonly deleteExisting?: boolean;
  /**
   * A comment to add on the record.
   * @default no comment
   * @stability stable
   */
  readonly comment?: string;
  /**
   * The hosted zone in which to define the new record.
   * @stability stable
   */
  readonly zone?: aws_route53.IHostedZone;
}
